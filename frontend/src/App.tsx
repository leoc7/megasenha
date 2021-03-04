import React, { useEffect, useState } from 'react';
import { server } from './services/server';
import './styles/App.css';
import { IPlayer } from './types/player';
import {
    IRoomGameData,
    IPlayerJoinEvent,
    IPlayerLeaveEvent,
    IPlayerUpdateEvent,
    IRoomTimerEvent,
    IRoomWordsEvent,
    IRoomWordEvent,
    IRoomStatusEvent,
    IRoomGameTurnEvent,
    IRoomGameWordSuccess,
    Status,
} from './types/events';
import FlipMove from 'react-flip-move';
import Modal from './components/Modal';
import useSound from 'use-sound';

const App: React.FC = () => {
    const [players, setPlayers] = useState<{ [id: string]: IPlayer }>({});
    const [words, setWords] = useState<string[]>([]);
    const [currentWord, setCurrentWord] = useState('');
    const [currentScore, setCurrentScore] = useState(0);
    const [status, setStatus] = useState<Status>(Status.ROUND_PLAYING);
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [time, setTime] = useState(30);
    const [timeInterval, setTimeInterval] = useState<NodeJS.Timeout | null>(null);

    const [nickname, setNickname] = useState('');
    const [isModalVisible, setModalVisible] = useState(true);
    const [isJoining, setJoining] = useState(false);

    const [playSuccessSound] = useSound('./success.mp3');

    function startGame() {
        server.emit('room-game-start');
    }

    function joinGame() {
        server.emit('room-join', {
            nickname,
            room: 'SAAS',
        });
        setJoining(true);
    }

    function handleStatusChange() {
        switch (status) {
            case Status.ROUND_INTERVAL:
                setWords([]);

                break;
            case Status.ROUND_PLAYING:
                if (player1 === playerId) setCurrentWord('*****');
                setCurrentScore(0);

                break;
        }

        console.log(Status[status]);
        setStatus(status);
    }

    function handleTimeStart(startTime: number) {
        setTimeInterval(interval => {
            if (interval) clearInterval(interval);

            return null;
        });
        setTime(startTime);

        const interval = setInterval(() => {
            setTime(oldTime => {
                if (oldTime === 0) {
                    setTimeInterval(interval => {
                        if (interval) clearInterval(interval);

                        return null;
                    });
                }

                return oldTime - 1;
            });
        }, 1000);

        setTimeInterval(interval);
    }

    function handleError() {
        server.emit('room-word-set-error');
    }

    function handleSuccess() {
        server.emit('room-word-set-success');
    }

    function setupServer() {
        server.on('room-game-data', ({ id, players, status, words, time }: IRoomGameData) => {
            setPlayers(players);
            setPlayerId(id);
            setStatus(status);
            setWords(words.currentList);
            setCurrentWord(words.currentWord);
            handleTimeStart(time);
            setModalVisible(false);
        });

        server.on('room-player-join', (player: IPlayerJoinEvent) => {
            setPlayers(oldPlayers => {
                return { ...oldPlayers, [player.id]: player };
            });
        });

        server.on('room-player-leave', ({ id }: IPlayerLeaveEvent) => {
            setPlayers(oldPlayers => {
                const players = Object.assign({}, oldPlayers);
                delete players[id];

                return players;
            });
        });

        server.on('room-game-timer', ({ time }: IRoomTimerEvent) => {
            handleTimeStart(time);
        });

        server.on('room-game-word', ({ word }: IRoomWordEvent) => {
            setCurrentWord(word);
        });

        server.on('room-game-words', ({ words }: IRoomWordsEvent) => {
            setWords(words);
        });

        server.on('room-status', ({ status }: IRoomStatusEvent) => {
            setStatus(status);
        });

        server.on('room-game-turn', ({ player1, player2 }: IRoomGameTurnEvent) => {
            setPlayer1(player1);
            setPlayer2(player2);
        });

        server.on('room-game-word-success', ({ score }: IRoomGameWordSuccess) => {
            setCurrentScore(score);
            playSuccessSound();
        });

        server.on('room-game-player-update', (player: IPlayerUpdateEvent) => {
            setPlayers(oldPlayers => {
                const players = Object.assign({}, oldPlayers);
                players[player.id] = player;

                const sortable = Object.fromEntries(Object.entries(players).sort(([, a], [, b]) => b.score - a.score));

                return sortable;
            });
        });

        server.on('room-game-word-error', () => {});
    }

    useEffect(setupServer, []);
    useEffect(handleStatusChange, [status]);

    return (
        <>
            <div className='wrapper'>
                <div className='container'>
                    <div className='player-list-container'>
                        <div className='game-word-title'>PONTUAÇÃO</div>
                        <div className='player-list'>
                            <FlipMove>
                                {Object.values(players).map(player => (
                                    <div
                                        key={player.id}
                                        className={
                                            'player-item' + (player.id === playerId ? ' player-item-highlight' : '')
                                        }>
                                        <span>{player.nickname}</span>
                                        <span>{player.score}</span>
                                    </div>
                                ))}
                            </FlipMove>
                        </div>
                    </div>
                    <div className='game-container'>
                        {status === Status.WAITING ? (
                            <div className='game-center-container'>
                                <p>ESPERANDO...</p>
                                <button onClick={startGame}>Começar</button>
                            </div>
                        ) : (
                            <div className='game-content-container'>
                                <div className='game-panel-container'>
                                    <div className='game-players-container'>
                                        {status === Status.ROUND_INTERVAL ? (
                                            <span>INTERVALO...</span>
                                        ) : (
                                            <>
                                                {status === Status.ROUND_START && <span>PREPARE-SE</span>}
                                                {player1 !== '' && player2 !== '' && (
                                                    <>
                                                        <span>
                                                            <span className='player-highlight'>
                                                                {players[player2].nickname}
                                                            </span>{' '}
                                                            DÁ AS DICAS
                                                        </span>
                                                        <span>
                                                            <span className='player-highlight'>
                                                                {players[player1].nickname}
                                                            </span>{' '}
                                                            RESPONDE
                                                        </span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <span>{time}s</span>
                                </div>

                                {status === Status.ROUND_PLAYING && (
                                    <div className='game-words-container'>
                                        <div className='game-words-counter'>
                                            {[...Array(5)].map((_, index) => (
                                                <div
                                                    className={
                                                        'game-words-check' + (currentScore > index ? ' success' : '')
                                                    }
                                                    key={index}></div>
                                            ))}
                                        </div>

                                        <div className='game-word-title'>{currentWord}</div>

                                        {player2 === playerId && (
                                            <div className='game-words-actions'>
                                                <button onClick={handleError}>ERROU</button>
                                                <button onClick={handleSuccess}>ACERTOU</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Modal isVisible={isModalVisible} width='400px'>
                <h3>QUAL SEU NOME?</h3>
                <input
                    type='text'
                    placeholder='Digita o nome aí fdp..'
                    minLength={1}
                    maxLength={20}
                    onChange={e => setNickname(e.target.value.toUpperCase())}></input>
                <div className='modal-actions'>
                    <button onClick={joinGame}>VAI</button>
                </div>
            </Modal>
        </>
    );
};

export default App;
