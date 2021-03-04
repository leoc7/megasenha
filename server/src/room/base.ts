import { GameBase } from '../game/base';

class Room {
    public game: GameBase;

    constructor(public code: string) {
        this.game = new GameBase(this.code);
    }
}

export { Room };
