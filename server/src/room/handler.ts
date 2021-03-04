import { IJoinRoomEvent } from './../types/events';
import { Socket } from 'socket.io';
import { RoomManager } from './manager';

class RoomHandler {
    private rooms = new RoomManager();

    public tick() {
        this.rooms.iterate(room => room.game.tick());
    }

    public join(client: Socket, data: IJoinRoomEvent) {
        const { room, nickname } = data;

        if (this.rooms.exists(room)) {
            client.rooms.forEach(room => client.leave(room));
            client.join(room);

            this.rooms.get(room).game.addPlayer(client, nickname);
            this.attachEventsToClient(client, room);
        }
    }

    public leave(client: Socket) {
        client.rooms.forEach(room => {
            client.leave(room);

            if (this.rooms.exists(room)) {
                this.rooms.get(room).game.removePlayer(client);
            }
        });
    }

    public attachEventsToClient(client: Socket, code: string) {
        const room = this.rooms.get(code);

        client.on('room-game-start', () => {
            room.game.start();
        });

        client.on('room-word-set-error', () => {
            room.game.setError(client.id);
        });

        client.on('room-word-set-success', () => {
            room.game.setSuccess(client.id);
        });
    }
}

export { RoomHandler };
