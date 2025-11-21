import React, { useState, useMemo } from 'react';
import { Player, CustomCharacters } from '../types';

interface CharacterCreatorProps {
    onCreationComplete: (characters: CustomCharacters) => void;
    onBack: () => void;
}

type Design = {
    color: string;
    face: 'smile' | 'simple' | 'surprised';
    ears: 'bear' | 'cat' | 'bunny';
};

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
const FACES = [
    { id: 'smile', name: 'にこにこ' },
    { id: 'simple', name: 'きょとん' },
    { id: 'surprised', name: 'びっくり' },
] as const;
const EARS = [
    { id: 'bear', name: 'くまさん' },
    { id: 'cat', name: 'ねこさん' },
    { id: 'bunny', name: 'うさぎさん' },
] as const;

const generateSVG = (design: Design | { color: null }): string => {
    // FIX: Add `'ears' in design` check to help TypeScript with type narrowing.
    if (!design.color || !('ears' in design)) {
        return `data:image/svg+xml;base64,${btoa('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 8"/></svg>')}`;
    }

    const strokeColor = '#1e293b';

    const facePaths = {
        smile: `<path d="M 35 65 Q 50 75 65 65" stroke="${strokeColor}" stroke-width="4" fill="none" stroke-linecap="round" />
                <circle cx="40" cy="55" r="5" fill="${strokeColor}" />
                <circle cx="60" cy="55" r="5" fill="${strokeColor}" />`,
        simple: `<circle cx="42" cy="58" r="5" fill="${strokeColor}" />
                 <circle cx="58" cy="58" r="5" fill="${strokeColor}" />`,
        surprised: `<circle cx="40" cy="55" r="7" fill="${strokeColor}" /><circle cx="60" cy="55" r="7" fill="${strokeColor}" />
                    <circle cx="50" cy="70" r="8" fill="none" stroke="${strokeColor}" stroke-width="4" />`,
    };

    const earPaths = {
        bear: `<circle cx="25" cy="25" r="15" fill="${design.color}" stroke="${strokeColor}" stroke-width="3" />
               <circle cx="75" cy="25" r="15" fill="${design.color}" stroke="${strokeColor}" stroke-width="3" />`,
        cat: `<path d="M 10 40 L 35 10 L 40 30 Z" fill="${design.color}" stroke="${strokeColor}" stroke-width="3" />
              <path d="M 90 40 L 65 10 L 60 30 Z" fill="${design.color}" stroke="${strokeColor}" stroke-width="3" />`,
        bunny: `<path d="M 20,35 C 10,5 30,5 30,30" fill="${design.color}" stroke="${strokeColor}" stroke-width="3" />
                <path d="M 80,35 C 90,5 70,5 70,30" fill="${design.color}" stroke="${strokeColor}" stroke-width="3" />`
    };

    const svgContent = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0, 5)">
                ${earPaths[design.ears]}
                <circle cx="50" cy="50" r="45" fill="${design.color}" stroke="${strokeColor}" stroke-width="3"/>
                ${facePaths[design.face]}
            </g>
        </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};


const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onCreationComplete, onBack }) => {
    const [p1Design, setP1Design] = useState<Design>({ color: COLORS[0], face: 'smile', ears: 'bear' });
    const [p2Design, setP2Design] = useState<Design>({ color: COLORS[3], face: 'simple', ears: 'cat' });
    
    const p1SVG = useMemo(() => generateSVG(p1Design), [p1Design]);
    const p2SVG = useMemo(() => generateSVG(p2Design), [p2Design]);

    const handleComplete = () => {
        if (p1Design.color && p2Design.color) {
            onCreationComplete({
                [Player.Black]: p1SVG,
                [Player.White]: p2SVG,
            });
        }
    };
    
    const canStart = p1Design.color && p2Design.color;

    return (
        <div className="min-h-screen bg-light-bg flex flex-col items-center justify-center p-4 font-pop">
            <h1 className="text-3xl md:text-4xl font-bold text-accent-blue mb-6">キャラクターをつくろう！</h1>
            
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
                {/* Player 1 Creator */}
                <CreatorPanel title="プレイヤー1" design={p1Design} setDesign={setP1Design} previewSVG={p1SVG} />
                {/* Player 2 Creator */}
                <CreatorPanel title="プレイヤー2" design={p2Design} setDesign={setP2Design} previewSVG={p2SVG} />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={handleComplete}
                    disabled={!canStart}
                    className="px-8 py-4 bg-green-500 text-white text-2xl font-bold rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                    このキャラクターであそぶ
                </button>
                <button 
                    onClick={onBack}
                    className="px-8 py-4 bg-slate-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all transform hover:scale-105"
                >
                    もどる
                </button>
            </div>
        </div>
    );
};

interface CreatorPanelProps {
    title: string;
    design: Design;
    setDesign: React.Dispatch<React.SetStateAction<Design>>;
    previewSVG: string;
}

const CreatorPanel: React.FC<CreatorPanelProps> = ({ title, design, setDesign, previewSVG }) => {
    return (
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-bold text-dark-text mb-4">{title}</h2>
            <div className="w-40 h-40 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <img src={previewSVG} alt={`${title} preview`} className="w-full h-full" />
            </div>

            {/* Color Selector */}
            <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">コマのいろ</h3>
                <div className="flex gap-2 justify-center">
                    {COLORS.map(color => (
                        <button key={color} onClick={() => setDesign(d => ({...d, color}))} 
                            className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 ${design.color === color ? 'ring-4 ring-accent-blue' : 'ring-2 ring-transparent'}`}
                            style={{backgroundColor: color}}
                            aria-label={`Color ${color}`}
                        />
                    ))}
                </div>
            </div>

            {/* Face Selector */}
            <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">かお</h3>
                <div className="flex gap-2 justify-center">
                    {FACES.map(face => (
                        <button key={face.id} onClick={() => setDesign(d => ({...d, face: face.id}))} 
                            className={`px-4 py-2 rounded-full font-bold text-sm ${design.face === face.id ? 'bg-accent-blue text-white' : 'bg-slate-200 text-slate-700'}`}
                        >
                           {face.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ears Selector */}
            <div>
                <h3 className="text-lg font-bold mb-2">みみ</h3>
                <div className="flex gap-2 justify-center">
                    {EARS.map(ear => (
                        <button key={ear.id} onClick={() => setDesign(d => ({...d, ears: ear.id}))} 
                            className={`px-4 py-2 rounded-full font-bold text-sm ${design.ears === ear.id ? 'bg-accent-blue text-white' : 'bg-slate-200 text-slate-700'}`}
                        >
                           {ear.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CharacterCreator;