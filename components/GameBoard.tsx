import React from 'react';
import { Board, Move, GameMode, CustomCharacters } from '../types';
import GameCell from './GameCell';

interface GameBoardProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
  validMoves: Move[];
  gameMode: GameMode;
  customCharacters?: CustomCharacters | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, validMoves, gameMode, customCharacters }) => {
  const isMoveValid = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  return (
    <div className="w-full aspect-square grid grid-cols-8 bg-board-border p-2 rounded-lg shadow-2xl">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            cellState={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
            isValidMove={isMoveValid(rowIndex, colIndex)}
            gameMode={gameMode}
            customCharacters={customCharacters}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;
