import React from 'react';
import { Player, Scores, GameMode, CustomCharacters } from '../types';
import { pandaSVG, catSVG, classicBlackSVG, classicWhiteSVG } from '../assets';


interface GameInfoProps {
  currentPlayer: Player;
  scores: Scores;
  onRestart: () => void;
  gameOver: boolean;
  winner: Player | 'draw' | null;
  turnSkippedMessage: string;
  gameMode: GameMode;
  customCharacters?: CustomCharacters | null;
}

const GameInfo: React.FC<GameInfoProps> = ({ currentPlayer, scores, onRestart, gameOver, winner, turnSkippedMessage, gameMode, customCharacters }) => {
  const getPlayerName = (player: Player): string => {
    if (gameMode === 'custom') {
      return player === Player.Black ? 'プレイヤー1' : 'プレイヤー2';
    }
    if (gameMode === 'classic') {
      return player === Player.Black ? 'くろ' : 'しろ';
    }
    return player === Player.Black ? 'パンダ' : 'ねこ';
  }

  const renderStatusMessage = () => {
    if (gameOver) {
      if (winner === 'draw') {
        return <h2 className="text-2xl text-accent-blue">ひきわけ！</h2>; // It's a Draw!
      }
      const winnerName = getPlayerName(winner as Player);
      return <h2 className="text-2xl text-accent-yellow">{winnerName}のかち！</h2>; // Panda/Cat Wins!
    }
    if (turnSkippedMessage) {
        return <p className="text-xl text-orange-500 h-8">{turnSkippedMessage}</p>;
    }
    const currentName = getPlayerName(currentPlayer);
    return <p className="text-xl h-8">{currentName}のターン</p>; // Panda's/Cat's Turn
  };

  const playerInfoClasses = (player: Player) => 
    `flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
      currentPlayer === player && !gameOver ? 'bg-yellow-200 scale-105 shadow-lg' : 'bg-white/50'
    }`;
  
  const getPlayerIcon = (player: Player) => {
    if (gameMode === 'custom' && customCharacters) {
        return player === Player.Black ? customCharacters[Player.Black] : customCharacters[Player.White];
    }
    if (gameMode === 'classic') {
        return player === Player.Black ? classicBlackSVG : classicWhiteSVG;
    }
    return player === Player.Black ? pandaSVG : catSVG;
  }
  
  const getPlayerAlt = (player: Player) => {
    if (gameMode === 'custom') {
        return player === Player.Black ? "Player 1's custom piece" : "Player 2's custom piece";
    }
    if (gameMode === 'classic') {
        return player === Player.Black ? "Black piece icon" : "White piece icon";
    }
    return player === Player.Black ? "Panda piece icon" : "Cat piece icon";
  }

  const BlackPlayerIcon = getPlayerIcon(Player.Black);
  const WhitePlayerIcon = getPlayerIcon(Player.White);
  const blackPlayerAlt = getPlayerAlt(Player.Black);
  const whitePlayerAlt = getPlayerAlt(Player.White);

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-lg flex flex-col items-center space-y-4">
      <div className="w-full flex justify-around items-center">
        <div className={playerInfoClasses(Player.Black)}>
          <img src={BlackPlayerIcon} alt={blackPlayerAlt} className="w-10 h-10" />
          <span className="text-3xl font-bold">{scores[Player.Black]}</span>
        </div>
        <div className={playerInfoClasses(Player.White)}>
          <img src={WhitePlayerIcon} alt={whitePlayerAlt} className="w-10 h-10" />
          <span className="text-3xl font-bold">{scores[Player.White]}</span>
        </div>
      </div>
      
      <div className="text-center h-12 flex items-center justify-center">
        {renderStatusMessage()}
      </div>

      <button
        onClick={onRestart}
        className="px-8 py-3 bg-accent-blue text-white text-xl font-bold rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
      >
        あたらしくはじめる
      </button>
    </div>
  );
};

export default GameInfo;
