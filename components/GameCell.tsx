import React from 'react';
import { CellState, Player, GameMode, CustomCharacters } from '../types';
import { pandaSVG, catSVG, classicBlackSVG, classicWhiteSVG } from '../assets';

interface GameCellProps {
  cellState: CellState;
  onClick: () => void;
  isValidMove: boolean;
  gameMode: GameMode;
  customCharacters?: CustomCharacters | null;
}

const GameCell: React.FC<GameCellProps> = ({ cellState, onClick, isValidMove, gameMode, customCharacters }) => {
  const renderPiece = () => {
    if (!cellState) return null;
    
    let src = '';
    let alt = '';

    if (gameMode === 'custom' && customCharacters) {
      src = cellState === Player.Black ? customCharacters[Player.Black] : customCharacters[Player.White];
      alt = 'Custom piece';
    } else if (gameMode === 'character') {
      if (cellState === Player.Black) {
        src = pandaSVG;
        alt = 'Panda piece';
      } else {
        src = catSVG;
        alt = 'Cat piece';
      }
    } else {
      if (cellState === Player.Black) {
        src = classicBlackSVG;
        alt = 'Black piece';
      } else {
        src = classicWhiteSVG;
        alt = 'White piece';
      }
    }
    
    return <img src={src} alt={alt} className="w-11/12 h-11/12 animate-pop" />;
  };

  const getAriaLabel = () => {
    if (cellState) {
        const playerName = gameMode === 'character' 
            ? (cellState === Player.Black ? 'Panda' : 'Cat')
            : gameMode === 'custom'
            ? (cellState === Player.Black ? 'Player 1' : 'Player 2')
            : (cellState === Player.Black ? 'Black' : 'White');
        return `Cell with ${playerName} piece`;
    }
    return isValidMove ? 'Valid move' : 'Empty cell';
  }

  return (
    <div
      className="bg-board-bg p-0.5 aspect-square flex justify-center items-center border border-board-border"
      onClick={onClick}
    >
      <button 
        className="w-full h-full flex justify-center items-center rounded-sm transition-colors duration-200"
        aria-label={getAriaLabel()}
        disabled={!isValidMove && !cellState}
      >
        {renderPiece()}
        {isValidMove && !cellState && (
          <div className="w-1/2 h-1/2 rounded-full bg-accent-yellow/70 animate-pulse"></div>
        )}
      </button>
    </div>
  );
};

export default GameCell;
