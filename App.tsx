
import React, { useState, useEffect, useCallback } from 'react';
import { Board, CellState, Move, Player, Scores, GameMode, CustomCharacters } from './types';
import { BOARD_SIZE } from './constants';
import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import HomeScreen from './components/CharacterSelection';
import CharacterCreator from './components/CharacterCreator';

const App: React.FC = () => {
    const createInitialBoard = (): Board => {
        const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        const mid = BOARD_SIZE / 2;
        board[mid - 1][mid - 1] = Player.White;
        board[mid - 1][mid] = Player.Black;
        board[mid][mid - 1] = Player.Black;
        board[mid][mid] = Player.White;
        return board;
    };

    const [board, setBoard] = useState<Board>(createInitialBoard());
    const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Black);
    const [scores, setScores] = useState<Scores>({ [Player.Black]: 2, [Player.White]: 2 });
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [winner, setWinner] = useState<Player | 'draw' | null>(null);
    const [validMoves, setValidMoves] = useState<Move[]>([]);
    const [turnSkippedMessage, setTurnSkippedMessage] = useState<string>('');
    const [gameMode, setGameMode] = useState<GameMode | null>(null);
    const [view, setView] = useState<'home' | 'creator' | 'game'>('home');
    const [customCharacters, setCustomCharacters] = useState<CustomCharacters | null>(null);

    const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

    const findValidMoves = useCallback((boardState: Board, player: Player): Move[] => {
        const moves: Move[] = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (boardState[r][c] !== null) continue;
                
                let isValid = false;
                for(const [dr, dc] of DIRS) {
                    let r_ = r + dr;
                    let c_ = c + dc;
                    let hasOpponentPiece = false;
                    while(r_ >= 0 && r_ < BOARD_SIZE && c_ >= 0 && c_ < BOARD_SIZE) {
                        if(boardState[r_][c_] === null) break;
                        if(boardState[r_][c_] !== player) {
                            hasOpponentPiece = true;
                        } else {
                            if(hasOpponentPiece) {
                                isValid = true;
                            }
                            break;
                        }
                        r_ += dr;
                        c_ += dc;
                    }
                    if(isValid) break;
                }
                if(isValid) moves.push({ row: r, col: c });
            }
        }
        return moves;
    }, [DIRS]);
    
    const calculateScores = useCallback((boardState: Board): Scores => {
        return boardState.flat().reduce((acc, cell) => {
            if (cell === Player.Black) acc[Player.Black]++;
            else if (cell === Player.White) acc[Player.White]++;
            return acc;
        }, { [Player.Black]: 0, [Player.White]: 0 });
    }, []);
    
    const handleRestart = useCallback(() => {
        const initialBoard = createInitialBoard();
        setBoard(initialBoard);
        setCurrentPlayer(Player.Black);
        setScores({ [Player.Black]: 2, [Player.White]: 2 });
        setGameOver(false);
        setWinner(null);
        setValidMoves(findValidMoves(initialBoard, Player.Black));
        setTurnSkippedMessage('');
    }, [findValidMoves]);

    const handleGameStart = (mode: GameMode) => {
        setGameMode(mode);
        handleRestart();
        setView('game');
    };

    const handleStartCreation = () => {
        setView('creator');
    };

    const handleCreationComplete = (characters: CustomCharacters) => {
        setCustomCharacters(characters);
        handleGameStart('custom');
    };
    
    const endGame = useCallback(() => {
        setGameOver(true);
        const finalScores = calculateScores(board);
        if (finalScores[Player.Black] > finalScores[Player.White]) setWinner(Player.Black);
        else if (finalScores[Player.White] > finalScores[Player.Black]) setWinner(Player.White);
        else setWinner('draw');
    }, [board, calculateScores]);

    useEffect(() => {
        if (gameOver || view !== 'game') return;

        const newValidMoves = findValidMoves(board, currentPlayer);
        
        if (newValidMoves.length === 0) {
            const opponent = currentPlayer === Player.Black ? Player.White : Player.Black;
            const opponentMoves = findValidMoves(board, opponent);
            if (opponentMoves.length > 0) {
                // Skip turn
                const skippedPlayerName = gameMode === 'custom'
                    ? (currentPlayer === Player.Black ? 'プレイヤー1' : 'プレイヤー2')
                    : (currentPlayer === Player.Black ? 'くろ' : 'しろ');
                setTurnSkippedMessage(`${skippedPlayerName}の番はスキップ！`);
                const timer = setTimeout(() => setTurnSkippedMessage(''), 2000);
                setCurrentPlayer(opponent);
                return () => clearTimeout(timer);
            } else {
                // Game over
                endGame();
            }
        } else {
            setValidMoves(newValidMoves);
            setTurnSkippedMessage('');
        }
    }, [board, currentPlayer, findValidMoves, gameOver, view, gameMode, endGame]);

    const handleCellClick = (row: number, col: number) => {
        if (gameOver || !validMoves.some(m => m.row === row && m.col === col)) return;

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentPlayer;

        for (const [dr, dc] of DIRS) {
            let r_ = row + dr;
            let c_ = col + dc;
            const toFlip: Move[] = [];
            while (r_ >= 0 && r_ < BOARD_SIZE && c_ >= 0 && c_ < BOARD_SIZE) {
                const piece = newBoard[r_][c_];
                if (piece === null) break;
                if (piece !== currentPlayer) {
                    toFlip.push({ row: r_, col: c_ });
                } else {
                    if (toFlip.length > 0) {
                        toFlip.forEach(p => {
                            newBoard[p.row][p.col] = currentPlayer;
                        });
                    }
                    break;
                }
                r_ += dr;
                c_ += dc;
            }
        }
        
        setBoard(newBoard);
        setScores(calculateScores(newBoard));
        setCurrentPlayer(currentPlayer === Player.Black ? Player.White : Player.Black);
    };

    if (view === 'home') {
        return <HomeScreen onGameStart={handleGameStart} onStartCreation={handleStartCreation} />;
    }

    if (view === 'creator') {
        return <CharacterCreator onCreationComplete={handleCreationComplete} onBack={() => setView('home')} />;
    }

    if (view === 'game' && gameMode) {
        return (
            <div className="min-h-screen bg-light-bg flex flex-col items-center justify-center p-4">
                <header className="w-full max-w-lg md:max-w-xl relative flex items-center justify-center mb-6">
                    <button 
                        onClick={() => setView('home')}
                        className="absolute left-0 z-10 text-slate-500 font-bold hover:text-slate-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-sm md:text-base"
                    >
                        ← ホーム
                    </button>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-wider text-accent-blue pointer-events-none" style={{textShadow: '2px 2px #FFFFFF'}}>
                        わくわくリバーシ
                    </h1>
                </header>
                <main className="w-full max-w-lg md:max-w-xl flex flex-col items-center space-y-6">
                    <GameInfo 
                        currentPlayer={currentPlayer}
                        scores={scores}
                        onRestart={handleRestart}
                        gameOver={gameOver}
                        winner={winner}
                        turnSkippedMessage={turnSkippedMessage}
                        gameMode={gameMode}
                        customCharacters={customCharacters}
                    />
                    <GameBoard
                        board={board}
                        onCellClick={handleCellClick}
                        validMoves={validMoves}
                        gameMode={gameMode}
                        customCharacters={customCharacters}
                    />
                </main>
                <footer className="text-center mt-8 text-slate-500 text-sm">
                    <p>たのしくあそんでね！</p>
                </footer>
            </div>
        );
    }
    
    return null; // Should not be reached
};

export default App;
