import { Room } from './base';

class RoomManager {
    private rooms: { [code: string]: Room } = {
        SAAS: new Room('SAAS'),
    };

    public add(code: string) {
        this.rooms[code] = new Room(code);
    }

    public get(code: string) {
        return this.rooms[code];
    }

    public remove(code: string) {
        delete this.rooms[code];
    }

    public count() {
        return Object.keys(this.rooms).length;
    }

    public exists(code: string) {
        return this.rooms.hasOwnProperty(code);
    }

    public iterate(callback: (room: Room) => void) {
        for (const code in this.rooms) {
            callback(this.rooms[code]);
        }
    }
}

export { RoomManager };
