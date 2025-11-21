import React, { useState, useRef, useEffect } from 'react';
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

// --- Helpers ---

const generateSVG = (design: Design): string => {
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

const processUploadedImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const size = Math.min(img.width, img.height);
                const canvas = document.createElement('canvas');
                canvas.width = 200; 
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                if(!ctx) return reject('No context');
                
                // Draw circle clip
                ctx.beginPath();
                ctx.arc(100, 100, 95, 0, Math.PI * 2);
                ctx.clip();

                // Draw image centered and cropped
                const sx = (img.width - size) / 2;
                const sy = (img.height - size) / 2;
                ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);

                // Draw border
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 6;
                ctx.stroke();
                
                resolve(canvas.toDataURL());
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

// --- Sub-Components ---

const TemplateEditor: React.FC<{ design: Design, setDesign: (d: Design) => void }> = ({ design, setDesign }) => (
    <div className="flex flex-col gap-4 w-full animate-pop">
         <div>
            <h3 className="text-sm font-bold mb-2 text-slate-500">いろ</h3>
            <div className="flex gap-2 justify-center flex-wrap">
                {COLORS.map(color => (
                    <button key={color} onClick={() => setDesign({...design, color})} 
                        className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${design.color === color ? 'ring-4 ring-accent-blue' : 'ring-2 ring-transparent'}`}
                        style={{backgroundColor: color}}
                        aria-label={`Color ${color}`}
                    />
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-sm font-bold mb-2 text-slate-500">かお</h3>
            <div className="flex gap-2 justify-center flex-wrap">
                {FACES.map(face => (
                    <button key={face.id} onClick={() => setDesign({...design, face: face.id as any})} 
                        className={`px-3 py-1 rounded-full font-bold text-xs transition-colors ${design.face === face.id ? 'bg-accent-blue text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                        {face.name}
                    </button>
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-sm font-bold mb-2 text-slate-500">みみ</h3>
            <div className="flex gap-2 justify-center flex-wrap">
                {EARS.map(ear => (
                    <button key={ear.id} onClick={() => setDesign({...design, ears: ear.id as any})} 
                        className={`px-3 py-1 rounded-full font-bold text-xs transition-colors ${design.ears === ear.id ? 'bg-accent-blue text-white' : 'bg-slate-200 text-slate-700'}`}
                    >
                        {ear.name}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const PhotoUploader: React.FC<{ onImageSelect: (img: string) => void }> = ({ onImageSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const processed = await processUploadedImage(e.target.files[0]);
                onImageSelect(processed);
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-48 w-full bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 hover:border-accent-blue transition-colors cursor-pointer group animate-pop"
             onClick={() => fileInputRef.current?.click()}>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📷</span>
            <span className="font-bold text-slate-500">しゃしんをえらぶ</span>
            <span className="text-xs text-slate-400 mt-1">または さつえいする</span>
        </div>
    );
};

const DrawingPad: React.FC<{ onUpdate: (img: string) => void }> = ({ onUpdate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#1e293b');
    const isDrawing = useRef(false);
    const lastPos = useRef<{x: number, y: number} | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Init white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);
        updateExport();
        
        // Set initial styles
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 5;
    }, []);

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.strokeStyle = color;
    }, [color]);

    const updateExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 200;
        tempCanvas.height = 200;
        const tCtx = tempCanvas.getContext('2d');
        if (!tCtx) return;
        
        // Circle clip
        tCtx.beginPath();
        tCtx.arc(100, 100, 95, 0, Math.PI * 2);
        tCtx.clip();
        
        // Draw original
        tCtx.drawImage(canvas, 0, 0);
        
        // Border
        tCtx.strokeStyle = '#1e293b';
        tCtx.lineWidth = 6;
        tCtx.stroke();
        
        onUpdate(tempCanvas.toDataURL());
    };

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return {x:0, y:0};
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        isDrawing.current = true;
        lastPos.current = getPos(e);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing.current || !lastPos.current) return;
        e.preventDefault(); // Prevent scrolling on touch
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const currentPos = getPos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        
        lastPos.current = currentPos;
    };

    const stopDrawing = () => {
        if (isDrawing.current) {
            isDrawing.current = false;
            lastPos.current = null;
            updateExport();
        }
    };
    
    const clear = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 200, 200);
            updateExport();
        }
    };

    return (
        <div className="flex flex-col items-center w-full animate-pop">
            <canvas
                ref={canvasRef}
                width={200}
                height={200}
                className="border-2 border-slate-300 rounded-full shadow-inner cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
                {['#1e293b', '#ef4444', '#22c55e', '#3b82f6', '#ffffff'].map(c => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full border border-slate-300 ${color === c ? 'ring-2 ring-offset-2 ring-accent-blue' : ''}`}
                        style={{ backgroundColor: c === '#ffffff' ? '#fff' : c }}
                        aria-label={c === '#ffffff' ? 'Eraser' : 'Color'}
                    >
                        {c === '#ffffff' && <span className="text-xs text-slate-500">消</span>}
                    </button>
                ))}
                <button onClick={clear} className="px-3 py-1 bg-slate-200 rounded-full text-xs font-bold ml-2">
                    クリア
                </button>
            </div>
        </div>
    );
};

// --- Main Component ---

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onCreationComplete, onBack }) => {
    const [activePlayer, setActivePlayer] = useState<Player>(Player.Black);
    const [p1Image, setP1Image] = useState<string | null>(null);
    const [p2Image, setP2Image] = useState<string | null>(null);
    const [mode, setMode] = useState<'template' | 'photo' | 'draw'>('template');
    
    // Defaults
    const [design, setDesign] = useState<Design>({
        color: '#ef4444',
        face: 'smile',
        ears: 'bear',
    });

    // Update image when template design changes
    useEffect(() => {
        if (mode === 'template') {
            const svg = generateSVG(design);
            if (activePlayer === Player.Black) setP1Image(svg);
            else setP2Image(svg);
        }
    }, [design, mode, activePlayer]);

    const handleImageUpdate = (img: string) => {
        if (activePlayer === Player.Black) setP1Image(img);
        else setP2Image(img);
    };

    const handleNext = () => {
        if (activePlayer === Player.Black) {
            // Setup default for player 2
            setActivePlayer(Player.White);
            setMode('template');
            setDesign({ color: '#3b82f6', face: 'simple', ears: 'cat' }); // Reset to a default for P2
        } else {
            if (p1Image && p2Image) {
                onCreationComplete({
                    [Player.Black]: p1Image,
                    [Player.White]: p2Image
                });
            }
        }
    };

    const currentImage = activePlayer === Player.Black ? p1Image : p2Image;
    const playerName = activePlayer === Player.Black ? 'プレイヤー1' : 'プレイヤー2';

    return (
        <div className="min-h-screen bg-light-bg flex flex-col items-center p-4 font-pop">
            <header className="w-full max-w-lg flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-slate-500 font-bold hover:text-slate-700">
                    ← もどる
                </button>
                <h1 className="text-xl font-bold text-accent-blue">
                    {playerName} のキャラ
                </h1>
                <div className="w-16"></div> {/* Spacer */}
            </header>

            <main className="w-full max-w-md flex flex-col items-center gap-6 bg-white p-6 rounded-2xl shadow-xl">
                {/* Preview */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-board-border overflow-hidden shadow-lg bg-board-bg flex items-center justify-center">
                        {currentImage && <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md ${activePlayer === Player.Black ? 'bg-black' : 'bg-white text-black border border-slate-200'}`}>
                        {activePlayer === Player.Black ? '黒' : '白'}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-full w-full">
                    {(['template', 'photo', 'draw'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => {
                                setMode(m);
                                if (m === 'template') {
                                    // Trigger template update immediately
                                    const svg = generateSVG(design);
                                    handleImageUpdate(svg);
                                }
                            }}
                            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${mode === m ? 'bg-white shadow text-accent-blue' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {m === 'template' && 'つくろう'}
                            {m === 'photo' && 'しゃしん'}
                            {m === 'draw' && 'おえかき'}
                        </button>
                    ))}
                </div>

                {/* Editors */}
                <div className="w-full min-h-[200px] flex justify-center">
                    {mode === 'template' && <TemplateEditor design={design} setDesign={setDesign} />}
                    {mode === 'photo' && <PhotoUploader onImageSelect={handleImageUpdate} />}
                    {mode === 'draw' && <DrawingPad onUpdate={handleImageUpdate} />}
                </div>

                {/* Actions */}
                <button
                    onClick={handleNext}
                    disabled={!currentImage}
                    className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-transform transform hover:-translate-y-1 active:scale-95 ${
                        currentImage 
                        ? 'bg-gradient-to-r from-accent-blue to-indigo-500 text-white' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {activePlayer === Player.Black ? 'つぎへ' : 'ゲームスタート！'}
                </button>
            </main>
        </div>
    );
};

export default CharacterCreator;