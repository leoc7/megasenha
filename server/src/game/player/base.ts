import { Socket } from 'socket.io';

class Player {
    public id: string;
    public score: number = 0;

    constructor(public socket: Socket, public nickname: string) {
        this.id = socket.id;
    }

    public object() {
        const { id, nickname, score } = this;

        return {
            id,
            nickname,
            score,
        };
    }
}

export { Player };
