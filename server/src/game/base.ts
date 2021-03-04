import { GameQueue } from './queue';
import { PlayerManager } from './player/manager';
import { Socket } from 'socket.io';
import { server } from '../app';
import { Player } from './player/base';
import { GameWords } from './words';

enum Status {
    WAITING = 0,
    ROUND_START = 1,
    ROUND_PLAYING = 2,
    ROUND_INTERVAL = 3,
}

class GameBase {
    private queue = new GameQueue();
    private words = new GameWords();
    private players = new PlayerManager();
    private status = Status.WAITING;

    private player1: string = '';
    private player2: string = '';

    private time = 0;

    constructor(private code: string) {}

    private preTickMap = {
        [Status.WAITING]: () => {},
        [Status.ROUND_START]: this.preRoundStart.bind(this),
        [Status.ROUND_PLAYING]: this.preRoundPlaying.bind(this),
        [Status.ROUND_INTERVAL]: this.preRoundInterval.bind(this),
    };

    private tickMap = {
        [Status.WAITING]: this.tickWaiting.bind(this),
        [Status.ROUND_START]: this.tickRoundStart.bind(this),
        [Status.ROUND_PLAYING]: this.tickRoundPlaying.bind(this),
        [Status.ROUND_INTERVAL]: this.tickRoundInterval.bind(this),
    };

    public tick() {
        this.tickMap[this.status]();
    }

    public addPlayer(client: Socket, nickname: string) {
        const player = new Player(client, nickname);

        this.players.add(player);
        this.queue.push(player.id);

        this.emitTo(player.id, 'room-game-data', {
            id: player.id,
            players: this.players.object(),
            words: this.words.object(),
            status: this.status,
            player1: this.player1,
            player2: this.player2,
            time: this.time,
        });

        this.broadcastTo(player.id, 'room-player-join', player.object());
    }

    public removePlayer(client: Socket) {
        const id = client.id;
        this.players.remove(id);
        this.queue.remove(id);

        if (this.player1 === id || this.player2 === id) {
            this.player1 = '';
            this.player2 = '';
            this.setStatus(Status.ROUND_INTERVAL);
        }

        this.emit('room-player-leave', { id });

        if (this.players.count() < 2) {
            this.setStatus(Status.WAITING);
        }
    }

    public setSuccess(triggerId: string) {
        if (triggerId !== this.player2) return;

        this.words.score++;

        const player1 = this.players.get(this.player1);
        player1.score += 5;

        const player2 = this.players.get(this.player2);
        player2.score += 1;

        this.emit('room-game-word-success', { score: this.words.score });
        this.emit('room-game-player-update', player1.object());
        this.emit('room-game-player-update', player2.object());

        if (this.words.score === 5) {
            this.setStatus(Status.ROUND_INTERVAL);
            return;
        }

        this.nextWord();
    }

    public setError(triggerId: string) {
        if (triggerId !== this.player2) return;

        if (this.words.score === 5) return;

        this.emit('room-game-word-error');
        this.nextWord();
    }

    private nextWord() {
        this.broadcastTo(this.player1, 'room-game-word', { word: this.words.next() });
    }

    public start() {
        if (this.players.count() < 2) return;
        this.setStatus(Status.ROUND_START);
    }

    private emit(event: string, ...args: any) {
        server.socket.to(this.code).emit(event, ...args);
    }

    private emitTo(id: string, event: string, ...args: any) {
        this.players.get(id).socket.emit(event, ...args);
    }

    private broadcastTo(id: string, event: string, ...args: any) {
        this.players.get(id).socket.broadcast.emit(event, ...args);
    }

    private tickWaiting() {}

    private preRoundStart() {
        this.time = 10;

        this.player1 = this.queue.first();
        this.player2 = this.queue.randomExcept(this.player1);

        this.emit('room-game-turn', {
            player1: this.player1,
            player2: this.player2,
        });

        this.emit('room-game-timer', { time: this.time });
    }

    private preRoundPlaying() {
        this.time = 30;
        this.words.reset();

        this.emit('room-game-timer', { time: this.time });
        this.nextWord();
    }

    private preRoundInterval() {
        this.time = 10;
        this.player1 = '';
        this.player2 = '';
        this.queue.forward();

        this.emit('room-game-timer', { time: this.time });
    }

    private tickRoundStart() {
        this.time--;

        if (this.time === 0) {
            this.setStatus(Status.ROUND_PLAYING);
        }
    }

    private tickRoundPlaying() {
        this.time--;

        if (this.time === 0) {
            this.setStatus(Status.ROUND_INTERVAL);
        }
    }

    private tickRoundInterval() {
        this.time--;

        if (this.time === 0) {
            this.setStatus(Status.ROUND_START);
        }
    }

    private setStatus(status: Status) {
        this.preTickMap[status]();
        this.status = status;

        this.emit('room-status', { status });
    }
}

export { GameBase };
