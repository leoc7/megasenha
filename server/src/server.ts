import { Server as IOServer, Socket } from 'socket.io';
import { GameWords } from './game/words';
import { RoomHandler } from './room/handler';

class Server {
    public socket = new IOServer(4743, {
        cors: {
            origin: '*',
        },
    });

    private roomHandler = new RoomHandler();

    private attachEvents() {
        this.socket.on('connection', (client: Socket) => {
            client.on('room-join', data => this.roomHandler.join(client, data));

            client.on('disconnecting', () => this.roomHandler.leave(client));
        });
    }

    private mainLoop() {
        this.roomHandler.tick();

        setTimeout(this.mainLoop.bind(this), 1000);
    }

    public start() {
        GameWords.load();
        this.attachEvents();
        this.mainLoop();
    }
}

export { Server };
