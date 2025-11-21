
import React from 'react';
import { GameMode } from '../types';
import { classicBlackSVG, classicWhiteSVG } from '../assets';

interface HomeScreenProps {
  onGameStart: (mode: GameMode) => void;
  onStartCreation: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onGameStart, onStartCreation }) => {
  return (
    <div className="min-h-screen bg-light-bg flex flex-col items-center justify-center p-4 text-center">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-accent-blue" style={{textShadow: '2px 2px #FFFFFF'}}>
          わくわくリバーシ
        </h1>
        <h2 className="text-2xl text-dark-text mt-4">どのコマであそぶ？</h2>
      </header>
      
      <main className="flex flex-col gap-8">
        <button
          onClick={onStartCreation}
          className="bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out w-80"
          aria-label="Create your own characters"
        >
          <p className="text-3xl font-bold">キャラクターをつくる</p>
        </button>
        
        <button
          onClick={() => onGameStart('classic')}
          className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out w-80"
          aria-label="Play with classic Black and White pieces"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
             <img src={classicBlackSVG} alt="Classic black icon" className="w-12 h-12" />
             <span className="text-2xl font-bold text-slate-500">VS</span>
             <img src={classicWhiteSVG} alt="Classic white icon" className="w-12 h-12" />
          </div>
          <p className="text-3xl font-bold text-slate-700">くろとしろ</p>
        </button>
      </main>
    </div>
  );
};

export default HomeScreen;
