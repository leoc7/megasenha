class GameQueue {
    private queue: string[] = [];

    public push(id: string) {
        this.queue.push(id);
    }

    public remove(id: string) {
        const index = this.queue.findIndex(val => val === id);

        if (index > -1) {
            this.queue.splice(index, 1);
        }
    }

    public forward() {
        const removed = this.queue.shift();

        if (removed) this.push(removed);
    }

    public first() {
        return this.queue[0];
    }

    public random() {
        return this.queue[Math.floor(Math.random() * this.queue.length)];
    }

    public randomExcept(id: string) {
        if (this.queue.length < 2) return '';

        let random = this.random();

        while (random === id) {
            random = this.random();
        }

        return random;
    }
}

export { GameQueue };
