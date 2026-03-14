import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Shield, Rocket, Target, AlertTriangle, RotateCcw, Languages, Info, Music, Volume2 } from 'lucide-react';

// --- Sound System ---
class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playShoot() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playExplosion() {
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playWin() {
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + i * 0.1);
      osc.stop(this.ctx!.currentTime + i * 0.1 + 0.3);
    });
  }

  playLose() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(55, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }
}

const sounds = new SoundManager();

// --- Types ---

type GameState = 'start' | 'playing' | 'win' | 'lose';
type Language = 'zh' | 'en';

interface Entity {
  id: number;
  x: number;
  y: number;
}

interface EnemyRocket extends Entity {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
}

interface Interceptor extends Entity {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
}

interface Explosion extends Entity {
  radius: number;
  maxRadius: number;
  expanding: boolean;
}

interface Battery {
  x: number;
  y: number;
  missiles: number;
  maxMissiles: number;
  active: boolean;
}

interface City {
  x: number;
  y: number;
  active: boolean;
}

// --- Constants ---

const WIN_SCORE = 1000;
const POINTS_PER_ROCKET = 20;
const EXPLOSION_SPEED = 2;
const EXPLOSION_MAX_RADIUS = 40;
const INTERCEPTOR_SPEED = 0.02;
const ROCKET_BASE_SPEED = 0.001;

const TRANSLATIONS = {
  zh: {
    title: "XJ新星防御",
    start: "开始游戏",
    restart: "再玩一次",
    win: "任务成功！",
    lose: "防御失败",
    score: "得分",
    target: "目标",
    missiles: "导弹",
    gameOver: "游戏结束",
    congrats: "恭喜！你成功守护了新星之城。",
    failed: "所有炮台已被摧毁，城市陷落。",
    howToPlay: "点击屏幕发射拦截导弹，预判敌方轨迹。",
    lang: "English",
    round: "回合"
  },
  en: {
    title: "XJ Nova Defense",
    start: "Start Game",
    restart: "Play Again",
    win: "Mission Success!",
    lose: "Defense Failed",
    score: "Score",
    target: "Target",
    missiles: "Missiles",
    gameOver: "Game Over",
    congrats: "Congrats! You successfully defended Nova City.",
    failed: "All batteries destroyed. The city has fallen.",
    howToPlay: "Click screen to fire interceptors. Predict paths.",
    lang: "中文",
    round: "Round"
  }
};

// --- Main Component ---

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [rocketsInWave, setRocketsInWave] = useState(10);
  const [rocketsSpawned, setRocketsSpawned] = useState(0);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [batteries, setBatteries] = useState<Battery[]>([
    { x: 0, y: 0, missiles: 20, maxMissiles: 20, active: true },
    { x: 0, y: 0, missiles: 40, maxMissiles: 40, active: true },
    { x: 0, y: 0, missiles: 20, maxMissiles: 20, active: true },
  ]);
  const [cities, setCities] = useState<City[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = TRANSLATIONS[lang];

  // Game Objects Refs
  const rocketsRef = useRef<EnemyRocket[]>([]);
  const interceptorsRef = useRef<Interceptor[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const nextIdRef = useRef(0);
  const frameRef = useRef(0);

  const initGame = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const newBatteries = [
      { x: width * 0.1, y: height - 40, missiles: 20, maxMissiles: 20, active: true },
      { x: width * 0.5, y: height - 40, missiles: 40, maxMissiles: 40, active: true },
      { x: width * 0.9, y: height - 40, missiles: 20, maxMissiles: 20, active: true },
    ];
    setBatteries(newBatteries);

    const newCities = [];
    const cityWidth = width / 10;
    for (let i = 0; i < 6; i++) {
      const x = (i < 3) 
        ? width * 0.2 + i * cityWidth 
        : width * 0.6 + (i - 3) * cityWidth;
      newCities.push({ x, y: height - 30, active: true });
    }
    setCities(newCities);
    
    setScore(0);
    setRound(1);
    setRocketsInWave(10);
    setRocketsSpawned(0);
    setIsWaveActive(true);
    rocketsRef.current = [];
    interceptorsRef.current = [];
    explosionsRef.current = [];
    setGameState('playing');
  }, []);

  const startNextRound = useCallback(() => {
    // Bonus points for remaining missiles
    const missileBonus = batteries.reduce((acc, b) => acc + (b.active ? b.missiles * 5 : 0), 0);
    setScore(s => s + missileBonus);

    // Refill missiles
    setBatteries(prev => prev.map(b => ({ ...b, missiles: b.maxMissiles })));
    
    setRound(r => r + 1);
    setRocketsInWave(prev => prev + 5);
    setRocketsSpawned(0);
    setIsWaveActive(true);
  }, [batteries]);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const targetX = clientX - rect.left;
    const targetY = clientY - rect.top;

    // Find nearest active battery with missiles
    let bestBattery = -1;
    let minDist = Infinity;

    batteries.forEach((b, i) => {
      if (b.active && b.missiles > 0) {
        const dist = Math.abs(b.x - targetX);
        if (dist < minDist) {
          minDist = dist;
          bestBattery = i;
        }
      }
    });

    if (bestBattery !== -1) {
      const battery = batteries[bestBattery];
      interceptorsRef.current.push({
        id: nextIdRef.current++,
        x: battery.x,
        y: battery.y,
        startX: battery.x,
        startY: battery.y,
        targetX,
        targetY,
        progress: 0,
        speed: INTERCEPTOR_SPEED
      });

      setBatteries(prev => prev.map((b, i) => 
        i === bestBattery ? { ...b, missiles: b.missiles - 1 } : b
      ));
      sounds.playShoot();
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const update = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Spawn Rockets
      if (isWaveActive && rocketsSpawned < rocketsInWave) {
        if (Math.random() < 0.01 + (round * 0.005)) {
          const startX = Math.random() * width;
          const targets = [...cities.filter(c => c.active), ...batteries.filter(b => b.active)];
          if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            rocketsRef.current.push({
              id: nextIdRef.current++,
              x: startX,
              y: 0,
              startX,
              startY: 0,
              targetX: target.x,
              targetY: target.y,
              progress: 0,
              speed: ROCKET_BASE_SPEED + (round * 0.0002) + Math.random() * 0.001
            });
            setRocketsSpawned(s => s + 1);
          }
        }
      }

      // Check if wave is over
      if (isWaveActive && rocketsSpawned >= rocketsInWave && rocketsRef.current.length === 0) {
        setIsWaveActive(false);
        setTimeout(() => {
          if (gameState === 'playing') startNextRound();
        }, 2000);
      }

      // 2. Update Rockets
      rocketsRef.current.forEach(r => {
        r.progress += r.speed;
        r.x = r.startX + (r.targetX - r.startX) * r.progress;
        r.y = r.startY + (r.targetY - r.startY) * r.progress;

        if (r.progress >= 1) {
          explosionsRef.current.push({
            id: nextIdRef.current++,
            x: r.targetX,
            y: r.targetY,
            radius: 0,
            maxRadius: EXPLOSION_MAX_RADIUS,
            expanding: true
          });
          r.progress = 2;
          
          setCities(prev => prev.map(c => 
            Math.abs(c.x - r.targetX) < 20 && Math.abs(c.y - r.targetY) < 20 ? { ...c, active: false } : c
          ));
          setBatteries(prev => prev.map(b => 
            Math.abs(b.x - r.targetX) < 20 && Math.abs(b.y - r.targetY) < 20 ? { ...b, active: false } : b
          ));
        }
      });
      rocketsRef.current = rocketsRef.current.filter(r => r.progress < 1.5);

      // 3. Update Interceptors
      interceptorsRef.current.forEach(i => {
        i.progress += i.speed;
        i.x = i.startX + (i.targetX - i.startX) * i.progress;
        i.y = i.startY + (i.targetY - i.startY) * i.progress;

        if (i.progress >= 1) {
          explosionsRef.current.push({
            id: nextIdRef.current++,
            x: i.targetX,
            y: i.targetY,
            radius: 0,
            maxRadius: EXPLOSION_MAX_RADIUS,
            expanding: true
          });
          i.progress = 2;
        }
      });
      interceptorsRef.current = interceptorsRef.current.filter(i => i.progress < 1.5);

      // 4. Update Explosions
      explosionsRef.current.forEach(e => {
        if (e.expanding) {
          e.radius += EXPLOSION_SPEED;
          if (e.radius >= e.maxRadius) e.expanding = false;
        } else {
          e.radius -= EXPLOSION_SPEED;
        }

        rocketsRef.current.forEach(r => {
          const dist = Math.sqrt((r.x - e.x) ** 2 + (r.y - e.y) ** 2);
          if (dist < e.radius) {
            r.progress = 2;
            setScore(s => s + POINTS_PER_ROCKET);
            sounds.playExplosion();
          }
        });
      });
      explosionsRef.current = explosionsRef.current.filter(e => e.radius > 0);

      if (score >= WIN_SCORE) {
        setGameState('win');
        sounds.playWin();
      } else if (batteries.every(b => !b.active)) {
        setGameState('lose');
        sounds.playLose();
      }
    };

    const draw = () => {
      // 1. Draw Background (Deep Space Gradient)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#020617'); // slate-950
      bgGradient.addColorStop(1, '#1e1b4b'); // indigo-950
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Stars (Static Starfield)
      ctx.fillStyle = '#ffffff';
      const starCount = 100;
      const seed = 123; // Simple deterministic seed for stars
      for (let i = 0; i < starCount; i++) {
        const x = (Math.sin(i * seed) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * seed * 1.5) * 0.5 + 0.5) * canvas.height;
        const size = (Math.sin(i) * 0.5 + 0.5) * 1.5;
        ctx.globalAlpha = 0.3 + Math.random() * 0.7; // Twinkle effect
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 3. Draw Ground
      const groundGradient = ctx.createLinearGradient(0, canvas.height - 40, 0, canvas.height);
      groundGradient.addColorStop(0, '#0f172a');
      groundGradient.addColorStop(1, '#020617');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, canvas.height - 40, canvas.width, 1);

      // 4. Draw Cities (Neon Buildings)
      cities.forEach(c => {
        if (c.active) {
          // Building Body
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(c.x - 15, c.y - 15, 30, 25);
          
          // Windows
          ctx.fillStyle = '#fbbf24';
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              if (Math.random() > 0.3) {
                ctx.fillRect(c.x - 12 + col * 10, c.y - 12 + row * 5, 4, 3);
              }
            }
          }
          
          // Roof Detail
          ctx.fillStyle = '#334155';
          ctx.fillRect(c.x - 18, c.y - 18, 36, 3);
          
          // Glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#3b82f6';
          ctx.strokeStyle = '#3b82f6';
          ctx.strokeRect(c.x - 15, c.y - 15, 30, 25);
          ctx.shadowBlur = 0;
        } else {
          // Ruined City
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(c.x - 15, c.y + 10);
          ctx.lineTo(c.x - 5, c.y - 5);
          ctx.lineTo(c.x + 10, c.y + 5);
          ctx.lineTo(c.x + 15, c.y + 10);
          ctx.fill();
        }
      });

      // 5. Draw Batteries (Futuristic Turrets)
      batteries.forEach(b => {
        if (b.active) {
          ctx.save();
          ctx.translate(b.x, b.y + 10);
          
          // Base
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(-25, 10);
          ctx.lineTo(25, 10);
          ctx.lineTo(15, -5);
          ctx.lineTo(-15, -5);
          ctx.closePath();
          ctx.fill();
          
          // Turret Head
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(0, -10, 12, Math.PI, 0);
          ctx.fill();
          
          // Barrel
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(0, -25);
          ctx.stroke();
          
          // Energy Glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#10b981';
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(0, -10, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          ctx.restore();
          
          // Missile count
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(`${b.missiles}`, b.x, b.y + 35);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(b.x - 15, b.y + 5, 30, 5);
        }
      });

      // 6. Draw Rockets (Chickens)
      rocketsRef.current.forEach(r => {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(r.startX, r.startY);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.save();
        ctx.translate(r.x, r.y);
        
        // Glow for chicken
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        
        // Body
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.beginPath();
        ctx.arc(6, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(9, -4);
        ctx.lineTo(13, -3);
        ctx.lineTo(9, -2);
        ctx.fill();
        
        // Comb
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(6, -8, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(7, -5, 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      // 7. Draw Interceptors
      interceptorsRef.current.forEach(i => {
        // Trail
        const trailGradient = ctx.createLinearGradient(i.startX, i.startY, i.x, i.y);
        trailGradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
        trailGradient.addColorStop(1, 'rgba(59, 130, 246, 0.5)');
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i.startX, i.startY);
        ctx.lineTo(i.x, i.y);
        ctx.stroke();
        
        // Missile Head
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        ctx.arc(i.x, i.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Target X
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(i.targetX - 5, i.targetY - 5);
        ctx.lineTo(i.targetX + 5, i.targetY + 5);
        ctx.moveTo(i.targetX + 5, i.targetY - 5);
        ctx.lineTo(i.targetX - 5, i.targetY + 5);
        ctx.stroke();
      });

      // 8. Draw Explosions
      explosionsRef.current.forEach(e => {
        const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, '#60a5fa'); // blue-400
        gradient.addColorStop(0.6, '#3b82f6'); // blue-500
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const loop = () => {
      update();
      draw();
      frameRef.current = requestAnimationFrame(loop);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState, score, cities, batteries, round, isWaveActive, rocketsSpawned, rocketsInWave, startNextRound]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none touch-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        className="block w-full h-full cursor-crosshair"
      />

      {/* HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <motion.div 
            key={score}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl"
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.score}</p>
            <p className="text-3xl font-black text-white">{score} <span className="text-sm text-slate-500">/ {WIN_SCORE}</span></p>
          </motion.div>
          <div className="flex gap-2">
            {batteries.map((b, i) => (
              <div key={i} className={`px-3 py-1 rounded-full text-[10px] font-bold border ${b.active ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}`}>
                {t.missiles} {i+1}: {b.missiles}
              </div>
            ))}
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 w-fit">
            {t.round}: {round}
          </div>
        </div>

        <button 
          onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
          className="pointer-events-auto bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all border border-white/10 flex items-center gap-2"
        >
          <Languages className="w-5 h-5 text-white" />
          <span className="text-xs font-bold text-white">{t.lang}</span>
        </button>
      </div>

      {/* Screens */}
      <AnimatePresence>
        {gameState === 'start' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-hidden"
          >
            {/* Decorative floating circles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                    y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 10 + i * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute rounded-full bg-emerald-200 blur-3xl"
                  style={{
                    width: `${200 + i * 100}px`,
                    height: `${200 + i * 100}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="max-w-md w-full text-center relative z-10">
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-emerald-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner"
              >
                <Shield className="text-emerald-500 w-12 h-12" />
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-6xl font-black text-slate-800 mb-4 tracking-tighter">
                  {t.title.split(' ')[0]}
                  <span className="text-emerald-500">.</span>
                </h1>
                <p className="text-slate-500 text-lg mb-12 font-medium leading-relaxed px-4">
                  {t.howToPlay}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-4"
              >
                <button
                  onClick={initGame}
                  className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-bold text-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 active:scale-95"
                >
                  {t.start} <Target className="w-6 h-6" />
                </button>
                
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Audio Enabled</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-200 rounded-full" />
                  <div className="flex items-center gap-2 text-slate-400">
                    <Music className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Fresh Beats</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {(gameState === 'win' || gameState === 'lose') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center">
              <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl ${gameState === 'win' ? 'bg-emerald-600 shadow-emerald-900/50' : 'bg-rose-600 shadow-rose-900/50'}`}>
                {gameState === 'win' ? <Trophy className="text-white w-12 h-12" /> : <AlertTriangle className="text-white w-12 h-12" />}
              </div>
              <h2 className="text-4xl font-black text-white mb-4">{gameState === 'win' ? t.win : t.lose}</h2>
              <p className="text-slate-400 mb-8">{gameState === 'win' ? t.congrats : t.failed}</p>
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t.score}</p>
                <p className="text-5xl font-black text-white">{score}</p>
              </div>

              <button
                onClick={initGame}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {t.restart} <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:hidden pointer-events-none">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <Target className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{t.howToPlay}</span>
        </div>
      </div>
    </div>
  );
}
