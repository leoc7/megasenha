import fs from 'fs';
import path from 'path';

class GameWords {
    public static wordList: string[] = [];
    private currentIndex = 0;
    public currentList: string[] = [];
    public currentWord = '';
    public score = 0;

    public static load() {
        const words = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'words.txt'), 'utf8');

        GameWords.wordList = words.split('\n').map(word => word.toUpperCase().replace('\r', ''));
    }

    public reset() {
        this.currentIndex = 0;
        this.currentList = [];
        this.currentWord = this.random();
        this.score = 0;
    }

    public next() {
        let word = this.random();

        if(this.currentList.length === GameWords.length - 1) {
            return '';
        }

        while (this.currentList.includes(word)) {
            word = this.random();
        }

        this.currentList.push(word);
        this.currentWord = word;

        return this.currentWord;
    }

    public random() {
        return GameWords.wordList[Math.floor(Math.random() * GameWords.wordList.length)];
    }

    public object() {
        const { currentList, currentIndex, currentWord } = this;

        return {
            currentList,
            currentIndex,
            currentWord,
        };
    }
}

export { GameWords };
