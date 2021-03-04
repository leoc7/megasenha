import { Player } from './base';

class PlayerManager {
    players: { [id: string]: Player } = {};

    public add(player: Player) {
        this.players[player.id] = player;
    }

    public get(id: string) {
        return this.players[id];
    }

    public remove(id: string) {
        delete this.players[id];
    }

    public count() {
        return Object.keys(this.players).length;
    }

    public object() {
        const players: { [id: string]: Object } = {};

        Object.values(this.players).forEach(player => {
            players[player.id] = player.object();
        });

        return players;
    }
}

export { PlayerManager };
