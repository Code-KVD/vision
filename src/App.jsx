import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ArrowRight, Menu, User, Flame, Wand2, Crown } from 'lucide-react';

const PREDICTIONS = [
  {
    id: 1,
    question: 'Will India win the 2026 T20 World Cup?',
    yesPercent: 62,
    noPercent: 38,
    total: '12,431',
    resolvesIn: '1 day'
  },
  {
    id: 2,
    question: 'Will Neuralink achieve human trials outside US by 2025?',
    yesPercent: 45,
    noPercent: 55,
    total: '8,920',
    resolvesIn: '142 days'
  },
  {
    id: 3,
    question: 'Will AGI be officially announced by OpenAI before 2028?',
    yesPercent: 28,
    noPercent: 72,
    total: '45,102',
    resolvesIn: '1,204 days'
  }
];

const BOTTOM_TABS = [
  { id: 'home', label: 'Home', icon: Flame, index: 0 },
  { id: 'create', label: 'Create', icon: Wand2, index: 1 },
  { id: 'leaderboard', label: 'Leaderboard', icon: Crown, index: 2 }
];

const AmbientBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#020202]">
      <div
        className="absolute inset-0 z-50 opacity-[0.05] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
        }}
      />

      <motion.div
        animate={{
          x: ['0vw', '25vw', '-15vw', '0vw'],
          y: ['0vh', '-15vh', '10vh', '0vh'],
          rotate: [0, 90, 180, 360],
          scale: [1, 1.2, 1.1, 1]
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-[20%] -left-[20%] w-[100vw] h-[100vw] rounded-full bg-indigo-600/25 blur-[120px] mix-blend-screen"
      />

      <motion.div
        animate={{
          x: ['0vw', '-25vw', '20vw', '0vw'],
          y: ['0vh', '20vh', '-15vh', '0vh'],
          rotate: [360, 180, 90, 0],
          scale: [1.1, 1, 1.3, 1.1]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[20%] -right-[30%] w-[90vw] h-[90vw] rounded-full bg-blue-700/20 blur-[130px] mix-blend-screen"
      />

      <motion.div
        animate={{
          x: ['-10vw', '15vw', '-10vw'],
          y: ['10vh', '-5vh', '10vh'],
          scale: [1, 1.4, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-10%] left-[10%] w-[80vw] h-[80vw] rounded-full bg-purple-800/20 blur-[110px] mix-blend-screen"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020202_110%)] opacity-90 z-10" />
    </div>
  );
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const currentPrediction = PREDICTIONS[currentIndex];

  const handleVote = (type) => {
    if (selectedVote) return;

    setSelectedVote(type);
    setIsPulsing(true);

    setTimeout(() => {
      setIsPulsing(false);
      setCurrentIndex((prev) => (prev + 1) % PREDICTIONS.length);
      setSelectedVote(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex justify-center w-full font-sans selection:bg-indigo-500/30">
      <div className="w-full max-w-[480px] relative min-h-screen border-x border-white/[0.04] bg-[#020202] overflow-hidden flex flex-col shadow-2xl">
        <AmbientBackground />

        <header className="relative z-40 pt-10 px-6">
          <div className="flex justify-between items-center">
            <button className="p-3 text-white/70 hover:text-white transition-all outline-none rounded-full bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.05] backdrop-blur-xl group shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
              <Menu size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </button>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black tracking-[0.2em] text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              VISION
            </motion.div>

            <button className="p-3 text-white/70 hover:text-white transition-all outline-none rounded-full bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.05] backdrop-blur-xl group shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
              <User size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </header>

        <main className="relative z-20 flex-1 flex flex-col justify-center px-4 pb-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isPulsing ? 1 : 0, scale: isPulsing ? 1.4 : 0.8 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none z-10"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPrediction.id}
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)', scale: 0.96 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, y: -50, filter: 'blur(16px)', scale: 1.02 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 w-full"
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full rounded-[2.5rem] p-6 sm:p-8 bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/[0.04] shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15),0_0_80px_rgba(79,70,229,0.08)] backdrop-blur-[40px]"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-indigo-400/10 blur-[90px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div className="flex items-center gap-2 text-[12px] text-white/50 font-medium tracking-wide">
                    <Clock size={14} className="text-white/40" />
                    <span>{currentPrediction.resolvesIn} remaining</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-white/50 font-medium tracking-wide">
                    <Users size={14} className="text-white/40" />
                    <span>{currentPrediction.total} predictions</span>
                  </div>
                </div>

                <h1 className="relative z-10 text-[44px] sm:text-[52px] font-semibold leading-[1.02] tracking-tighter text-center text-white/95 mb-14 text-balance drop-shadow-2xl">
                  {currentPrediction.question}
                </h1>

                <div className="relative z-10 mb-12 w-full">
                  <div className="flex justify-between text-[13px] font-bold tracking-widest mb-4">
                    <span className="text-indigo-100/90 drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]">
                      YES {currentPrediction.yesPercent}%
                    </span>
                    <span className="text-white/40">NO {currentPrediction.noPercent}%</span>
                  </div>

                  <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/[0.08] shadow-inner relative">
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${currentPrediction.yesPercent}%`, opacity: 1 }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-300 rounded-full shadow-[0_0_20px_rgba(129,140,248,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                    />
                  </div>
                </div>

                <div className="relative z-10 w-full flex gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote('yes')}
                    className={`group relative flex-1 py-5 rounded-[2rem] font-semibold text-[15px] tracking-wide transition-all duration-500 overflow-hidden
                      ${selectedVote === 'yes'
                        ? 'bg-white text-black scale-95 shadow-[0_0_60px_rgba(255,255,255,0.4)]'
                        : 'bg-white/95 text-black shadow-[0_8px_32px_rgba(255,255,255,0.15)] hover:bg-white hover:shadow-[0_12px_40px_rgba(255,255,255,0.35),0_0_30px_rgba(255,255,255,0.2)]'
                      }
                      ${selectedVote === 'no' ? 'opacity-20 grayscale scale-95' : 'opacity-100'}
                    `}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      YES
                      {selectedVote === 'yes' && (
                        <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                          <ArrowRight size={16} />
                        </motion.span>
                      )}
                    </span>
                    {selectedVote === 'yes' && (
                      <motion.div
                        layoutId="ripple-yes"
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="absolute inset-0 bg-indigo-400/40 rounded-full pointer-events-none"
                      />
                    )}
                    <div
                      className="absolute inset-0 rounded-[2rem] border border-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ clipPath: 'inset(0 0 80% 0)' }}
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote('no')}
                    className={`group relative flex-1 py-5 rounded-[2rem] font-semibold text-[15px] tracking-wide transition-all duration-500 overflow-hidden backdrop-blur-xl
                      ${selectedVote === 'no'
                        ? 'bg-white/10 border-white/30 text-white scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]'
                        : 'bg-white/[0.02] border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-white/80 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.15)]'
                      }
                      ${selectedVote === 'yes' ? 'opacity-20 grayscale scale-95' : 'opacity-100'}
                    `}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      NO
                      {selectedVote === 'no' && (
                        <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                          <ArrowRight size={16} />
                        </motion.span>
                      )}
                    </span>
                    {selectedVote === 'no' && (
                      <motion.div
                        layoutId="ripple-no"
                        initial={{ scale: 0, opacity: 0.4 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="absolute inset-0 bg-white/20 rounded-full pointer-events-none"
                      />
                    )}
                    <div
                      className="absolute inset-0 rounded-[2rem] border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ clipPath: 'inset(0 0 80% 0)' }}
                    />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Liquid Glass Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-40 pb-8 px-6 pointer-events-none">
          <div className="pointer-events-auto flex justify-between items-center bg-white/[0.02] backdrop-blur-[40px] border border-white/[0.08] rounded-full p-2 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] relative">
            {BOTTOM_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 flex items-center justify-center outline-none group tap-highlight-transparent transition-all duration-500 ease-out ${isActive ? 'px-5 py-3.5 w-auto' : 'flex-1 py-3.5'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-blob"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)] backdrop-blur-md"
                      transition={{ type: 'spring', stiffness: 480, damping: 35 }}
                    />
                  )}
                  <motion.div
                    className="relative z-10 flex items-center justify-center overflow-hidden"
                    animate={{
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)'
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <Icon size={isActive ? 20 : 24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                    <AnimatePresence mode="popLayout">
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                          animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                          exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="text-[14px] font-bold tracking-wide whitespace-nowrap block"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
