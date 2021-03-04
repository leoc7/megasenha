import { IPlayer } from './player';

export interface IPlayerJoinEvent extends IPlayer {}

export interface IPlayerUpdateEvent extends IPlayer {}

export interface IPlayerLeaveEvent {
    id: string;
}

export interface IRoomTimerEvent {
    time: number;
}

export interface IRoomWordsEvent {
    words: string[];
}

export interface IRoomWordEvent {
    word: string;
}

export enum Status {
    WAITING = 0,
    ROUND_START = 1,
    ROUND_PLAYING = 2,
    ROUND_INTERVAL = 3,
}

export interface IRoomStatusEvent {
    status: Status;
}

export interface IRoomGameTurnEvent {
    player1: string;
    player2: string;
}

export interface IGameWords {
    currentList: string[];
    currentIndex: number;
    currentWord: string;
}

export interface IRoomGameData extends IRoomGameTurnEvent, IRoomTimerEvent, IRoomStatusEvent {
    id: string;
    players: { [id: string]: IPlayer };
    words: IGameWords;
}

export interface IRoomGameWordSuccess {
    score: number;
}