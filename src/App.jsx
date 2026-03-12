import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ArrowRight, ArrowLeft, Menu, User, Home, Plus, Crown, Sparkles, Flame, Share2, Shield, Zap, Rocket, Check, Settings, Edit2, MessageCircle, Bell, Award, MapPin, Activity, CheckCircle2, XCircle, Target, TrendingUp, BadgeCheck, Heart, ChevronRight, Loader2, Info } from 'lucide-react';

const RISK_BADGES = {
  safe: { label: 'SAFE', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', shadow: 'drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]' },
  bold: { label: 'BOLD', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', shadow: 'drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]' },
  hot_take: { label: 'HOT TAKE', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', shadow: 'drop-shadow-[0_0_12px_rgba(251,146,60,0.5)]' },
  crazy: { label: 'CRAZY', icon: Rocket, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', shadow: 'drop-shadow-[0_0_12px_rgba(244,114,182,0.5)]' }
};

const CAROUSEL_ITEMS = [
  {
    id: 'potd',
    tag: '🔥 Prediction of the Day',
    tagColor: 'text-orange-400',
    title: 'Will AGI be announced before 2030?',
    content: (
      <div className="flex flex-col mt-2">
        <div className="flex rounded-full overflow-hidden h-2 mb-2 bg-white/10">
          <div className="bg-indigo-400 h-full" style={{ width: '41%' }} />
          <div className="bg-white/30 h-full" style={{ width: '59%' }} />
        </div>
        <div className="flex justify-between text-[11px] font-bold tracking-widest uppercase">
          <span className="text-indigo-300">YES 41%</span>
          <span className="text-white/50">NO 59%</span>
        </div>
      </div>
    ),
    action: 'Predict Now',
    bg: 'from-orange-500/20 via-orange-600/10 to-transparent',
    border: 'border-orange-500/30'
  },
  {
    id: 'trending',
    tag: '⚡ Trending Right Now',
    tagColor: 'text-yellow-400',
    title: 'Will Bitcoin hit $150k before 2028?',
    content: (
      <div className="flex items-center gap-2 mt-3 text-white/60">
        <Users size={14} />
        <span className="text-[12px] font-bold tracking-widest uppercase">8,421 predictions</span>
      </div>
    ),
    action: 'Join the crowd',
    bg: 'from-yellow-500/20 via-yellow-600/10 to-transparent',
    border: 'border-yellow-500/30'
  },
  {
    id: 'friends',
    tag: '👥 Friend Activity',
    tagColor: 'text-blue-400',
    title: 'Seth just predicted YES on "Will India win T20 World Cup 2026?"',
    content: (
      <div className="flex items-center gap-2 mt-3">
        <div className="h-6 w-6 rounded-full bg-indigo-500/30 flex items-center justify-center">
          <User size={12} className="text-indigo-300" />
        </div>
        <span className="text-[12px] text-white/60 font-medium">2 mins ago</span>
      </div>
    ),
    action: 'Say Something',
    bg: 'from-blue-500/20 via-blue-600/10 to-transparent',
    border: 'border-blue-500/30'
  }
];

const PREDICTIONS = [
  {
    id: 1,
    question: 'AI will replace junior developers before 2032',
    yesPercent: 61,
    noPercent: 39,
    total: '54,291',
    resolvesIn: '6 years',
    potentialAura: '+1,500',
    riskLevel: 'hot_take',
    creator: 'Seth Freakin Rollins',
    creatorAura: 7650,
    likes: 342,
    comments: 89
  },
  {
    id: 2,
    question: 'Will India win the 2026 T20 World Cup?',
    yesPercent: 62,
    noPercent: 38,
    total: '12,431',
    resolvesIn: '1 day',
    potentialAura: '+450',
    riskLevel: 'bold',
    creator: 'Ashpak',
    creatorAura: 1600,
    likes: 124,
    comments: 42
  },
  {
    id: 3,
    question: 'Will Neuralink achieve human trials outside US by 2025?',
    yesPercent: 45,
    noPercent: 55,
    total: '8,920',
    resolvesIn: '142 days',
    potentialAura: '+820',
    riskLevel: 'crazy',
    creator: 'Ekansh',
    creatorAura: 2100,
    likes: 83,
    comments: 17
  },
  {
    id: 4,
    question: 'Will AGI be officially announced by OpenAI before 2028?',
    yesPercent: 28,
    noPercent: 72,
    total: '45,102',
    resolvesIn: '1,204 days',
    potentialAura: '+1,240',
    riskLevel: 'safe',
    creator: 'KVD',
    creatorAura: 4500,
    likes: 1042,
    comments: 384
  }
];

const BOTTOM_TABS = [
  { id: 'home', label: 'Home', icon: Home, index: 0, color: '#8b5cf6', glowClass: 'bg-violet-500/30 border-violet-400/50 shadow-[0_0_30px_rgba(139,92,246,0.8)]' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Crown, index: 1, color: '#eab308', glowClass: 'bg-yellow-500/30 border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.8)]' },
  { id: 'create', label: 'Create', icon: Plus, index: 2, color: '#3b82f6', glowClass: 'bg-blue-500/30 border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.8)]' },
  { id: 'activity', label: 'Activity', icon: Activity, index: 3, color: '#10b981', glowClass: 'bg-emerald-500/30 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.8)]' },
  { id: 'profile', label: 'Profile', icon: User, index: 4, color: '#ec4899', glowClass: 'bg-pink-500/30 border-pink-400/50 shadow-[0_0_30px_rgba(236,72,153,0.8)]' }
];

export const VisionIcon = ({ size = 64, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* The Downward Triangle (Enlightenment / Foresight Axis) */}
    <path
      d="M 22 30 L 78 30 L 50 78 Z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
    />

    {/* The Bija / Prediction Node (Perfectly centered at the visual centroid) */}
    <circle cx="50" cy="48" r="5.5" fill="currentColor" />
  </svg>
);

const AmbientBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#020106]">
      {/* High-performance cinematic mixed aura gradient */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 50%', '50% 100%', '0% 50%', '0% 0%'],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-50%] z-0 opacity-80"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(30, 5, 60, 0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(20, 5, 40, 0.5) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(40, 10, 80, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 40%), radial-gradient(ellipse at 10% 20%, rgba(0, 0, 0, 0.8) 0%, transparent 70%)',
          backgroundSize: '150% 150%',
          filter: 'blur(40px)'
        }}
      />

      {/* Cinematic Film Grain */}
      <div
        className="absolute inset-0 z-50 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
        }}
      />

      {/* Deep black void vignettes for focus and shadow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#010005]/80 via-transparent to-[#000000]/95 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000000_150%)] pointer-events-none z-[11]" />
    </div>
  );
};

const HomeDiscoveryScreen = ({ userName, onPredictPress }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full flex flex-col h-full pt-10 pb-32 overflow-y-auto no-scrollbar scroll-smooth"
    >
      <div className="flex flex-col relative z-10 pt-4 w-full">
        <div className="flex flex-col gap-6 px-5">
          <h1 className="text-[54px] leading-tight font-black text-white tracking-tight text-balance">
            Hey there,<br />{userName}!
          </h1>

          {/* Auto-Rotating Carousel */}
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset }) => {
                  const swipe = offset.x;
                  if (swipe < -50) {
                    setCarouselIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
                  } else if (swipe > 50) {
                    setCarouselIndex((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);
                  }
                }}
                onClick={onPredictPress}
                className={`w-full h-[250px] flex flex-col bg-gradient-to-br border rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-pointer relative overflow-hidden group ${CAROUSEL_ITEMS[carouselIndex].bg} ${CAROUSEL_ITEMS[carouselIndex].border}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] pointer-events-none rounded-full" />

                <div className="flex flex-col relative z-10 basis-full">
                  <span className={`text-[12px] font-bold tracking-[0.15em] uppercase mb-3 block ${CAROUSEL_ITEMS[carouselIndex].tagColor}`}>
                    {CAROUSEL_ITEMS[carouselIndex].tag}
                  </span>

                  <h3 className="text-[20px] font-black leading-snug text-white mb-2 drop-shadow-md text-balance">
                    {CAROUSEL_ITEMS[carouselIndex].title}
                  </h3>

                  {CAROUSEL_ITEMS[carouselIndex].content}
                </div>

                <div className="mt-auto relative z-10 w-fit px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase transition-colors backdrop-blur-md">
                  {CAROUSEL_ITEMS[carouselIndex].action}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-1">
              {CAROUSEL_ITEMS.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${idx === carouselIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>

          {/* Huge CTA */}
          <button
            onClick={onPredictPress}
            className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-[20px] tracking-wide uppercase transition-all shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            Start Predicting
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ArrowRight size={24} />
            </motion.div>
          </button>
        </div>

        <div className="w-full mt-8 mb-5">
          {/* Category Chips */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {['All', 'Trending', 'AI & Tech', 'Sports', 'Crypto', 'Politics', 'Pop Culture', 'Economics', 'Science'].map((category, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-colors border ${activeCategory === category
                  ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'bg-white/[0.02] text-white/50 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Prediction List */}
        <div className="grid grid-cols-2 gap-4 px-5 pb-12 w-full relative z-10">
          {[
            { q: 'Will Apple release foldable iPhone before 2027?', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            { q: 'Will Bitcoin hit $150k before 2028?', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { q: 'Will India win T20 World Cup 2026?', icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10' },
            { q: 'Will Neuralink achieve human trials outside US by 2025?', icon: Rocket, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { q: 'Will AGI be officially announced by OpenAI before 2028?', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { q: 'Will GTA 6 win Game of the Year in 2025?', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="w-full aspect-[4/5] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col justify-between cursor-pointer backdrop-blur-md transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="flex justify-start relative z-10">
                <div className={`rounded-full p-2.5 ${item.bg}`}>
                  <item.icon size={16} className={item.color} />
                </div>
              </div>
              <p className="text-white font-bold text-[18px] leading-snug flex-1 mt-4 drop-shadow-lg relative z-10 text-balance line-clamp-4">
                {item.q}
              </p>

              <button
                onClick={onPredictPress}
                className="w-full relative z-10 mt-4 bg-white hover:bg-white/90 text-black py-3 rounded-xl font-black text-[12px] tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                Predict
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const CreatePredictionScreen = ({ onPublish }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState([]);
  const [shake, setShake] = useState(false);

  const categories = ['Tech', 'Finance', 'Sports', 'Politics'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032];

  const getDaysInMonth = (m, y) => {
    if (!m) return 31;
    const yVal = y ? parseInt(y) : new Date().getFullYear();
    return new Date(yVal, months.indexOf(m) + 1, 0).getDate();
  };

  const currentDays = getDaysInMonth(month, year);

  // Auto clamp day if month has fewer days
  if (day && parseInt(day) > currentDays) {
    setDay(currentDays.toString());
  }

  const handleSubmit = () => {
    if (isSubmitted) {
      setTitle('');
      setCategory('');
      setRiskLevel('');
      setMonth('');
      setDay('');
      setYear('');
      setIsSubmitted(false);
      setErrors([]);
    } else {
      const newErrors = [];
      if (!title.trim()) newErrors.push('title');
      if (!category) newErrors.push('category');
      if (!riskLevel) newErrors.push('riskLevel');
      if (!month) newErrors.push('month');
      if (!day) newErrors.push('day');
      if (!year) newErrors.push('year');

      if (newErrors.length > 0) {
        setErrors(newErrors);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      setErrors([]);
      setIsSubmitted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full flex flex-col h-full pt-10 pb-32 overflow-y-auto no-scrollbar scroll-smooth px-6"
    >
      <h1 className="text-[32px] leading-[1.05] font-bold text-white/95 tracking-tight text-balance mb-8">
        Create Prediction
      </h1>

      <div className="flex flex-col gap-6 w-full flex-1">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, x: shake ? [-10, 10, -10, 10, -5, 5, 0] : 0 }}
              transition={{ duration: shake ? 0.4 : 0.6 }}
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
              className="flex flex-col gap-8 w-full"
            >
              {/* Title */}
              <div className="flex flex-col gap-2.5">
                <label className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${errors.includes('title') ? 'text-red-400' : 'text-white/40'}`}>Title</label>
                <textarea
                  placeholder="Will India have a female Prime Minister before 2030?"
                  rows={4}
                  className={`w-full bg-white/[0.03] border rounded-3xl p-5 text-white placeholder:text-white/20 outline-none transition-colors text-[18px] sm:text-[20px] resize-none ${errors.includes('title') ? 'border-red-500 shadow-[inset_0_2px_15px_rgba(239,68,68,0.2)] focus:border-red-400' : 'border-white/[0.08] focus:border-white/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]'}`}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.includes('title')) setErrors(errors.filter(err => err !== 'title'));
                  }}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2.5">
                <label className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${errors.includes('category') ? 'text-red-400' : 'text-white/40'}`}>Category</label>
                <div className={`flex flex-wrap gap-2 rounded-2xl p-1.5 -m-1.5 transition-colors ${errors.includes('category') ? 'border border-red-500/50 bg-red-500/5' : 'border border-transparent'}`}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        if (errors.includes('category')) setErrors(errors.filter(err => err !== 'category'));
                      }}
                      className={`px-4 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-colors border ${category === cat ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/[0.02] text-white/50 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Level */}
              <div className="flex flex-col gap-2.5">
                <label className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${errors.includes('riskLevel') ? 'text-red-400' : 'text-white/40'}`}>Risk Level</label>
                <div className={`grid grid-cols-2 gap-2 mt-1 rounded-2xl p-1.5 -m-1.5 transition-colors ${errors.includes('riskLevel') ? 'border border-red-500/50 bg-red-500/5' : 'border border-transparent'}`}>
                  {Object.entries(RISK_BADGES).map(([key, badge]) => {
                    const BadgeIcon = badge.icon;
                    const isSelected = riskLevel === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setRiskLevel(key);
                          if (errors.includes('riskLevel')) setErrors(errors.filter(err => err !== 'riskLevel'));
                        }}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border transition-all duration-300 ${isSelected ? `${badge.bg} ${badge.border} ${badge.shadow}` : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'}`}
                      >
                        <BadgeIcon size={16} className={isSelected ? badge.color : 'text-white/40'} />
                        <span className={`text-[11px] font-bold tracking-[0.2em] ${isSelected ? badge.color : 'text-white/40'}`}>{badge.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Date */}
              <div className="flex flex-col gap-2.5">
                <label className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${(errors.includes('month') || errors.includes('day') || errors.includes('year')) ? 'text-red-400' : 'text-white/40'}`}>Resolution Date</label>
                <div className="flex gap-2">
                  <select
                    value={month}
                    onChange={(e) => {
                      setMonth(e.target.value);
                      if (errors.includes('month')) setErrors(errors.filter(err => err !== 'month'));
                    }}
                    className={`flex-[2] bg-white/[0.03] border rounded-2xl px-5 py-5 text-white hover:bg-white/[0.05] outline-none transition-colors text-[18px] appearance-none cursor-pointer ${errors.includes('month') ? 'border-red-500 shadow-[inset_0_2px_15px_rgba(239,68,68,0.2)] focus:border-red-400' : 'border-white/[0.08] focus:border-white/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]'}`}
                  >
                    <option value="" disabled className="bg-[#020202] text-[15px]">Month</option>
                    {months.map(m => <option key={m} value={m} className="bg-[#020202] text-[15px]">{m}</option>)}
                  </select>

                  <select
                    value={day}
                    onChange={(e) => {
                      setDay(e.target.value);
                      if (errors.includes('day')) setErrors(errors.filter(err => err !== 'day'));
                    }}
                    className={`flex-1 bg-white/[0.03] border rounded-2xl px-2 py-5 text-white hover:bg-white/[0.05] outline-none transition-colors text-[18px] appearance-none cursor-pointer text-center ${errors.includes('day') ? 'border-red-500 shadow-[inset_0_2px_15px_rgba(239,68,68,0.2)] focus:border-red-400' : 'border-white/[0.08] focus:border-white/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]'}`}
                  >
                    <option value="" disabled className="bg-[#020202] text-[15px]">Day</option>
                    {Array.from({ length: currentDays }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d} className="bg-[#020202] text-[15px]">{d}</option>
                    ))}
                  </select>

                  <select
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      if (errors.includes('year')) setErrors(errors.filter(err => err !== 'year'));
                    }}
                    className={`flex-[1.5] bg-white/[0.03] border rounded-2xl px-2 py-5 text-white hover:bg-white/[0.05] outline-none transition-colors text-[18px] appearance-none cursor-pointer text-center ${errors.includes('year') ? 'border-red-500 shadow-[inset_0_2px_15px_rgba(239,68,68,0.2)] focus:border-red-400' : 'border-white/[0.08] focus:border-white/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]'}`}
                  >
                    <option value="" disabled className="bg-[#020202] text-[15px]">Year</option>
                    {years.map(y => <option key={y} value={y} className="bg-[#020202] text-[15px]">{y}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full flex-1 flex flex-col items-center justify-center text-center gap-4 mt-10"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-2 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                <Check size={32} strokeWidth={3} />
              </div>
              <h2 className="text-white font-bold text-[24px] tracking-tight text-balance">Prediction sent for review!</h2>
              <p className="text-white/60 text-[15px] leading-relaxed max-w-[250px]">
                You will be notified when it goes live.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic CTA */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleSubmit}
            className={`w-full bg-white hover:bg-white/90 text-black py-5 rounded-[1.5rem] font-black text-[15px] tracking-[0.2em] uppercase transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]`}
          >
            {isSubmitted ? 'Create another prediction' : 'Submit'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardScreen = () => {
  const [activeTab, setActiveTab] = useState('Global');
  const tabs = ['Global', 'Weekly', 'Accuracy'];

  const firstNames = ['John', 'Jane', 'Alex', 'Chris', 'Katie', 'Mike', 'Sarah', 'David', 'Laura', 'Dan', 'Emma', 'Tom', 'Lucy', 'Max', 'Zoe', 'Sam', 'Mia', 'Leo', 'Eva', 'Ian'];
  const baseCities = ['New York', 'Bengaluru', 'Miami', 'London', 'Tokyo', 'Berlin', 'Dubai', 'Bhilai', 'Paris', 'Toronto'];

  const generateData = (baseArray, isAcc) => {
    let result = [...baseArray];
    for (let i = result.length; i < 50; i++) {
      const name = firstNames[i % firstNames.length] + ' ' + String.fromCharCode(65 + (i % 26)) + '.';
      const aura = isAcc ? (2000 - i * 15).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : (3000 - i * 20).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const loc = baseCities[i % baseCities.length];
      const acc = (90 - i % 30) + '%';
      result.push(isAcc ? { name, aura, acc } : { name, aura, loc });
    }
    return result;
  };

  const leaderboardData = {
    Global: generateData([
      { name: 'Seth Freakin Rollins', aura: '4,120', loc: 'Iowa' },
      { name: 'Srikant', aura: '3,980', loc: 'Bengaluru' },
      { name: 'Ashpak', aura: '3,980', loc: 'Bhilai' },
      { name: 'Ekansh', aura: '3,450', loc: 'Mumbai' },
      { name: 'KVD', aura: '3,210', loc: 'Bengaluru' },
      { name: 'Marcus', aura: '2,840', loc: 'Berlin' },
    ], false),
    Weekly: generateData([
      { name: 'Srikant', aura: '+850', loc: 'Bhilai' },
      { name: 'Ekansh', aura: '+720', loc: 'Mumbai' },
      { name: 'Seth', aura: '+610', loc: 'Iowa' },
      { name: 'Aisha', aura: '+590', loc: 'Dubai' },
      { name: 'KVD', aura: '+430', loc: 'Bengaluru' },
      { name: 'Ashpak', aura: '+410', loc: 'Bhilai' },
    ], false),
    Accuracy: generateData([
      { name: 'Aisha', aura: '2,100', acc: '94%' },
      { name: 'Srikant', aura: '3,980', acc: '88%' },
      { name: 'Seth', aura: '4,120', acc: '85%' },
      { name: 'Tyson', aura: '1,500', acc: '82%' },
      { name: 'Elena', aura: '2,900', acc: '79%' },
      { name: 'Ekansh', aura: '3,450', acc: '77%' },
    ], true)
  };

  const currentData = leaderboardData[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full flex flex-col h-full pt-10 pb-48 overflow-y-auto no-scrollbar scroll-smooth px-6"
    >
      <div className="flex flex-col mb-8">
        <h1 className="text-[40px] leading-[1.05] font-bold text-white/95 tracking-tight text-balance">
          Leaderboard
        </h1>
        <div className="text-white/40 text-[12px] font-bold tracking-[0.25em] uppercase mt-2 flex items-center gap-2">
          <Crown size={14} className="text-yellow-400" />
          Top Visionaries
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-white/[0.02] p-1.5 rounded-full border border-white/[0.05]">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === tab ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-white/50 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative mb-8 w-full rounded-[2rem] px-6 py-6 bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(79,70,229,0.15)] flex-shrink-0">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[40px] rounded-[2rem] pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex flex-col justify-center gap-1.5">
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/50 uppercase">Your Rank</span>
            <span className="text-[32px] font-black text-white drop-shadow-lg leading-tight">#23</span>
          </div>
          <div className="h-14 w-px bg-white/10" />
          <div className="flex flex-col justify-center items-center gap-1.5">
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/50 uppercase">Aura</span>
            <span className="text-[22px] font-black text-violet-300 leading-tight">1,240</span>
          </div>
          <div className="h-14 w-px bg-white/10" />
          <div className="flex flex-col justify-center items-end gap-1.5">
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/50 uppercase">Accuracy</span>
            <span className="text-[22px] font-black text-green-400 leading-tight">67%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <AnimatePresence mode="popLayout">
          {currentData.map((user, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              key={user.name + activeTab}
              className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-3xl p-4 shadow-[inset_0_1px_10px_rgba(0,0,0,0.2)]"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : idx === 1 ? 'bg-zinc-400/20 text-zinc-300' : idx === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/40'}`}>
                {idx + 1}
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[16px] font-bold text-white/90">{user.name}</span>
                <span className="text-[11px] font-medium tracking-wide text-white/40">
                  {activeTab === 'Accuracy' ? `Accuracy: ${user.acc}` : user.loc}
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[16px] font-black tracking-tight text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-violet-400" />
                  {user.aura}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Aura</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const RatingLadderModal = ({ isOpen, onClose }) => {
  const RANKS = [
    { name: 'Visionary', min: 5000, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]', border: 'border-amber-400/50', gradient: 'from-amber-500/20 to-transparent' },
    { name: 'Oracle', min: 2500, icon: Sparkles, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', glow: 'shadow-[0_0_25px_rgba(232,121,249,0.3)]', border: 'border-fuchsia-400/30', gradient: 'from-fuchsia-500/20 to-transparent' },
    { name: 'Sage', min: 1550, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.2)]', border: 'border-purple-400/20', gradient: 'from-purple-500/20 to-transparent' },
    { name: 'Strategist', min: 1000, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/20', glow: 'shadow-[0_0_25px_rgba(129,140,248,0.4)]', border: 'border-indigo-400/50', gradient: 'from-indigo-500/30 to-indigo-900/10', current: true },
    { name: 'Seeker', min: 500, icon: Rocket, color: 'text-blue-400', bg: 'bg-blue-500/5', glow: 'shadow-[0_0_15px_rgba(96,165,250,0.15)]', border: 'border-blue-400/20', gradient: 'from-blue-500/10 to-transparent' },
    { name: 'Novice', min: 0, icon: User, color: 'text-zinc-400', bg: 'bg-zinc-500/5', glow: '', border: 'border-zinc-400/10', gradient: 'from-zinc-500/5 to-transparent' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-[85vh] bg-[#050505] border-t border-white/[0.08] rounded-t-[2.5rem] z-[101] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Cinematic Background Blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[300px] bg-indigo-500/10 blur-[100px] pointer-events-none rounded-[100%]" />

            <div className="w-full flex justify-center py-4 relative z-10">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>

            <div className="px-8 pb-6 border-b border-white/[0.04] flex justify-between items-center relative z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-[24px] font-black text-white flex items-center gap-3 tracking-tight">
                  <Crown size={24} className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" /> Aura Ladder
                </h2>
                <span className="text-[12px] text-white/40 font-medium tracking-wide">Climb to the top by generating Aura</span>
              </div>
              <button onClick={onClose} className="p-2.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <XCircle size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-8 flex flex-col relative z-10">
              <div className="flex flex-col gap-6 relative">
                {/* Cinematic Glowing Connecting Line */}
                <div className="absolute left-[27px] top-[30px] bottom-[30px] w-1 rounded-full bg-gradient-to-b from-amber-500 via-indigo-500 to-zinc-800 opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-0" />

                {RANKS.map((rank, i) => {
                  const RankIcon = rank.icon;
                  const isVisionary = rank.name === 'Visionary';

                  return (
                    <motion.div
                      key={rank.name}
                      animate={isVisionary ? { y: [0, -4, 0] } : {}}
                      transition={isVisionary ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : {}}
                      className={`relative z-10 flex items-center gap-6 group transition-all duration-500 ${rank.current ? 'scale-105 my-4' : (isVisionary ? 'opacity-100 scale-[1.02] my-2' : 'opacity-60 hover:opacity-100')}`}
                    >
                      {/* Magical Aura for Visionary */}
                      {isVisionary && (
                        <>
                          <div className="absolute inset-0 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none -z-10" />
                          <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute -left-3 -top-3 text-amber-300 opacity-60 pointer-events-none"><Sparkles size={14} /></motion.div>
                          <motion.div animate={{ rotate: -360, scale: [1, 1.5, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute -bottom-2 left-12 text-amber-500 opacity-40 pointer-events-none"><Sparkles size={10} /></motion.div>
                        </>
                      )}

                      {/* Active Rank Pulse Effect */}
                      {(rank.current || isVisionary) && (
                        <div className={`absolute left-0 w-[58px] h-[58px] rounded-full ${rank.bg} blur-xl animate-pulse -z-10`} />
                      )}

                      <div className={`relative w-[58px] h-[58px] rounded-full shrink-0 flex items-center justify-center bg-[#0a0a0a] border-[3px] shadow-xl transition-all duration-500
                        ${rank.current || isVisionary ? rank.border + ' ' + rank.glow : 'border-white/[0.05] group-hover:border-white/[0.2]'}
                      `}>
                        {isVisionary && <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(251,191,36,0.4)] pointer-events-none" />}
                        <RankIcon size={isVisionary ? 28 : 24} className={`${rank.color} relative z-10 transition-all duration-500 ${rank.current || isVisionary ? 'drop-shadow-[0_0_15px_currentColor] scale-110' : ''}`} />
                      </div>

                      <div className={`flex-1 flex flex-col justify-center bg-gradient-to-r ${rank.gradient} border ${rank.current || isVisionary ? rank.border + ' ' + rank.glow : 'border-white/[0.03] group-hover:border-white/[0.08]'} p-5 rounded-3xl backdrop-blur-md relative overflow-hidden transition-all duration-500`}>
                        {/* Shimmer Sweep exactly for Visionary */}
                        {isVisionary && (
                          <motion.div
                            animate={{ x: ['-200%', '300%'] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                            className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-amber-200/20 to-transparent skew-x-[-25deg] pointer-events-none"
                          />
                        )}
                        {(rank.current || isVisionary) && <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />}

                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[18px] font-black tracking-wide ${rank.color} drop-shadow-md`}>{rank.name}</span>
                          <span className="text-[16px] font-black text-white/80">{rank.min.toLocaleString()}<span className="text-[12px] text-white/30 ml-1 uppercase font-bold tracking-widest">Aura</span></span>
                        </div>

                        {rank.current && (
                          <div className="w-fit text-[9px] text-white font-bold uppercase tracking-[0.2em] bg-white/10 px-3 py-1.5 rounded-full border border-white/[0.05] mt-2 flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Current Rank
                          </div>
                        )}
                        {isVisionary && !rank.current && (
                          <div className="w-fit text-[9px] text-amber-300 font-bold uppercase tracking-[0.2em] bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 mt-2 flex items-center gap-1.5 shadow-sm">
                            <Sparkles size={10} className="text-amber-400" /> Supreme Level
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const NetworkModal = ({ isOpen, onClose, type, onUserClick }) => {
  const [networkUsers, setNetworkUsers] = useState([
    { id: 1, name: 'Ashpak', isFollowing: true, username: '@sheikhashpak', aura: 1600 },
    { id: 2, name: 'Ekansh', isFollowing: false, username: '@ekanshtiwari', aura: 2100 },
    { id: 3, name: 'KVD', isFollowing: true, username: '@kvd_sridhar', aura: 4500 }
  ]);

  const handleToggleFollow = (id) => {
    setNetworkUsers(users =>
      users.map(u => u.id === id ? { ...u, isFollowing: !u.isFollowing } : u)
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-[75vh] bg-black/60 backdrop-blur-3xl border-t border-white/[0.15] rounded-t-[2.5rem] z-[101] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-full flex justify-center py-4">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white capitalize">{type}</h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-4">
              {networkUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center bg-white/[0.03] border border-white/[0.05] p-3 rounded-[1.25rem] shadow-[inset_0_1px_10px_rgba(0,0,0,0.2)] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onUserClick?.(user)}>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <User size={16} className="text-white/70" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white tracking-wide leading-none">{user.name}</span>
                      <span className="text-[11px] text-white/50 font-medium tracking-wide mt-1">{user.username}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFollow(user.id)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all shadow-md ${user.isFollowing ? 'bg-white/[0.05] border border-white/[0.1] text-white/70 hover:bg-white/[0.1] hover:text-white' : 'bg-indigo-500 text-white hover:bg-indigo-400 border border-indigo-400/50 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'}`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const BadgesModal = ({ isOpen, onClose }) => {
  const BADGE_TYPES = [
    { name: 'First Blood', desc: 'Made your first bold prediction', icon: Flame },
    { name: 'The Oracle', desc: 'Nailed 10 correct predictions', icon: Crown },
    { name: 'Sharpshooter', desc: 'Secure a 5 win streak', icon: Target },
    { name: 'Risk Taker', desc: 'Bet on < 10% odds event', icon: Zap },
    { name: 'To The Moon', desc: 'Accumulate 1,000 Aura', icon: Rocket },
    { name: 'Guardian', desc: 'Voted safely 20 times', icon: Shield },
    { name: 'Pioneer', desc: 'First to vote on a market', icon: Sparkles },
    { name: 'Addict', desc: 'Active for 7 straight days', icon: Activity },
    { name: 'Elite', desc: 'Reach top 10% on ladder', icon: Award },
    { name: 'Verified', desc: 'Complete your profile setups', icon: BadgeCheck }
  ];

  const BADGES = Array.from({ length: 100 }).map((_, i) => {
    const type = BADGE_TYPES[i % BADGE_TYPES.length];
    const colors = ['text-amber-400', 'text-fuchsia-400', 'text-purple-400', 'text-indigo-400', 'text-blue-400', 'text-emerald-400', 'text-rose-400'];
    const bgs = ['bg-amber-400/10', 'bg-fuchsia-400/10', 'bg-purple-400/10', 'bg-indigo-400/10', 'bg-blue-400/10', 'bg-emerald-400/10', 'bg-rose-400/10'];
    const borders = ['border-amber-400/50', 'border-fuchsia-400/50', 'border-purple-400/50', 'border-indigo-400/50', 'border-blue-400/50', 'border-emerald-400/50', 'border-rose-400/50'];

    const level = Math.floor(i / BADGE_TYPES.length) + 1;
    const name = level > 1 ? `${type.name} ${level}` : type.name;

    return {
      id: i,
      name: name,
      desc: type.desc,
      icon: type.icon,
      color: colors[i % 7],
      bg: bgs[i % 7],
      border: borders[i % 7],
      locked: i >= 12
    };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-[85vh] bg-[#050505] border-t border-white/[0.08] rounded-t-[2.5rem] z-[101] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="w-full flex justify-center py-4 relative z-10">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>
            <div className="px-8 pb-6 border-b border-white/[0.04] flex justify-between items-center relative z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-[24px] font-black text-white flex items-center gap-3 tracking-tight">
                  <Award size={24} className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" /> Badges
                </h2>
                <span className="text-[12px] text-white/40 font-medium tracking-wide">Your earned achievements</span>
              </div>
              <button onClick={onClose} className="p-2.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <XCircle size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 relative z-10">
              <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                {BADGES.map((badge) => {
                  const BIcon = badge.icon;
                  return (
                    <div key={badge.id} className="flex flex-col items-center group relative pt-3">
                      <div className={`relative w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center p-3 transition-all duration-500
                        ${badge.locked ? 'bg-white/[0.02] border border-white/5 opacity-40 grayscale' : `bg-gradient-to-br from-white/[0.05] to-black border ${badge.border} shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:scale-[1.05] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.8)]`}`}>

                        {/* Ribbon element */}
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-sm text-[9px] font-black tracking-widest uppercase shadow-xl z-20
                          ${badge.locked ? 'bg-zinc-800 text-zinc-500' : `bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/10 ${badge.color}`}`}>
                          <div className={`absolute -left-[3px] -bottom-[3px] w-[6px] h-[6px] rotate-45 -z-10 ${badge.locked ? 'bg-zinc-900' : 'bg-zinc-950'}`}></div>
                          <div className={`absolute -right-[3px] -bottom-[3px] w-[6px] h-[6px] rotate-45 -z-10 ${badge.locked ? 'bg-zinc-900' : 'bg-zinc-950'}`}></div>
                          Lvl {Math.floor(badge.id / 10) + 1}
                        </div>

                        {/* Inner glowing circle */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 relative shrink-0
                          ${badge.locked ? 'bg-white/5' : badge.bg}`}>
                          {!badge.locked && <div className={`absolute inset-0 rounded-full blur-lg ${badge.bg} -z-10 opacity-70`} />}
                          <BIcon size={28} className={badge.locked ? 'text-white/20' : badge.color} />
                        </div>

                        <span className={`text-[11px] font-black text-center leading-none mb-1.5 px-1 tracking-wide
                          ${badge.locked ? 'text-white/40' : 'text-white drop-shadow-md'}`}>
                          {badge.name}
                        </span>

                        <span className="text-[9px] text-white/40 text-center font-medium leading-[1.2] line-clamp-2 px-1">
                          {badge.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SettingsModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-[85vh] bg-[#050505] border-t border-white/[0.08] rounded-t-[2.5rem] z-[101] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="w-full flex justify-center py-4 relative z-10">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>
            <div className="px-8 pb-6 border-b border-white/[0.04] flex justify-between items-center relative z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-[24px] font-black text-white flex items-center gap-3 tracking-tight">
                  <Settings size={24} className="text-white drop-shadow-md" /> Settings
                </h2>
              </div>
              <button onClick={onClose} className="p-2.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <XCircle size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 relative z-10 flex flex-col gap-4">
              {['Account', 'Notifications', 'Privacy', 'Help & Support', 'About VISION'].map((item) => (
                <button key={item} className="w-full bg-white/[0.03] border border-white/[0.05] p-5 rounded-2xl flex justify-between items-center hover:bg-white/[0.06] transition-all text-left group">
                  <span className="text-[16px] text-white font-bold tracking-wide">{item}</span>
                  <ChevronRight size={18} className="text-white/40 group-hover:text-white/80 transition-colors" />
                </button>
              ))}
              <button className="w-full bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex justify-between items-center hover:bg-red-500/20 transition-all text-left mt-4">
                <span className="text-[16px] text-red-500 font-bold tracking-wide shadow-sm">Log Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MetricsModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-[85vh] bg-[#050505] border-t border-white/[0.08] rounded-t-[2.5rem] z-[101] flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[300px] bg-sky-500/10 blur-[100px] pointer-events-none rounded-[100%]" />

            <div className="w-full flex justify-center py-4 relative z-10">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-8 pb-6 border-b border-white/[0.04] flex justify-between items-center relative z-10">
              <div className="flex flex-col gap-1">
                <h2 className="text-[24px] font-black text-white flex items-center gap-3 tracking-tight">
                  <Info size={24} className="text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]" /> Metrics Guide
                </h2>
                <span className="text-[12px] text-white/40 font-medium tracking-wide">Understanding your stats</span>
              </div>
              <button onClick={onClose} className="p-2.5 bg-white/[0.03] border border-white/[0.05] rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <XCircle size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20 relative z-10">
              <div className="p-6 flex flex-col gap-8">

                {/* Aura Points Section */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-yellow-500/5 blur-xl group-hover:bg-yellow-500/10 transition-colors pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <Crown size={24} className="text-yellow-400" />
                    <h3 className="text-[18px] font-bold text-white tracking-wide">Aura Points</h3>
                  </div>
                  <p className="text-white/60 text-[14px] leading-relaxed mb-6 relative z-10">
                    Aura is your overall social and gaming presence (XP). It measures how active, influential, and right you are on Vision. <strong className="text-white/90">Aura goes up AND down.</strong> You gain it for good predictions, followers, and engagement, but lose it for bad predictions or losing followers. It dictates your Prestige Rank.
                  </p>
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex justify-between items-center text-[13px] border-b border-white/5 pb-2">
                      <span className="text-white/40">Creating a Prediction</span>
                      <span className="text-yellow-400 font-bold">+50</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] border-b border-white/5 pb-2">
                      <span className="text-white/40">Voting/Correct Prediction</span>
                      <span className="text-yellow-400 font-bold">+10 to +30</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] border-b border-white/5 pb-2">
                      <span className="text-white/40">Receiving a Comment Like</span>
                      <span className="text-yellow-400 font-bold">+2</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] border-b border-white/5 pb-2">
                      <span className="text-white/40">Losing a Follower</span>
                      <span className="text-red-400 font-bold">-5</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] border-b border-white/5 pb-2">
                      <span className="text-white/40">Incorrect Prediction</span>
                      <span className="text-red-400 font-bold">-15</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-white/40">Moderator Flag (Needs Changes)</span>
                      <span className="text-red-400 font-bold">-20</span>
                    </div>
                  </div>
                </div>

                {/* Forecast Rating Section */}
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-violet-500/5 blur-xl group-hover:bg-violet-500/10 transition-colors pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <TrendingUp size={24} className="text-violet-400" />
                    <h3 className="text-[18px] font-bold text-white tracking-wide">Forecast Rating</h3>
                  </div>
                  <p className="text-white/60 text-[14px] leading-relaxed mb-6 relative z-10">
                    Forecast Rating is pure gameplay. It's a competitive matchmaking score (ELO) that measures your analytical skills for making a prediction and getting it right. <strong className="text-white/90">Forecast Rating goes up AND down</strong>. It's fluid, intellectual, and high-stakes.
                  </p>
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex justify-between items-start text-[13px] border-b border-white/5 pb-2">
                      <span className="text-white/40 flex-1">Correct (Underdog / Bold)</span>
                      <span className="text-green-400 font-bold ml-4">+40 to +65</span>
                    </div>
                    <div className="flex justify-between items-start text-[13px] border-b border-white/5 pb-2">
                      <span className="text-white/40 flex-1">Correct (Safe)</span>
                      <span className="text-green-400 font-bold ml-4">+5 to +15</span>
                    </div>
                    <div className="flex justify-between items-start text-[13px]">
                      <span className="text-white/40 flex-1">Incorrect Prediction</span>
                      <span className="text-red-400 font-bold ml-4">-20 to -40</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const ProfileScreen = ({ name, setName, username, city, hasChangedName, setHasChangedName, onOpenNetwork, onOpenRating, onOpenBadges, onOpenSettings, onOpenMetrics, isReadOnly, onBack, aura }) => {
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameSave = () => {
    if (name.trim()) {
      setIsEditingName(false);
      setHasChangedName(true);
    }
  };

  const getStats = (profileName, currentAura) => {
    const hash = profileName ? profileName.length : 6;

    // Use actual passed aura, or simulate based on hash fallback
    const rawScore = currentAura || (hash > 6 ? 1840 : 1420);

    const RANKS = [
      { name: 'Visionary', min: 5000 },
      { name: 'Oracle', min: 2500 },
      { name: 'Sage', min: 1550 },
      { name: 'Strategist', min: 1000 },
      { name: 'Seeker', min: 500 },
      { name: 'Novice', min: 0 }
    ];

    let currentRankIdx = RANKS.findIndex(r => rawScore >= r.min);
    if (currentRankIdx === -1) currentRankIdx = RANKS.length - 1;

    const currentRank = RANKS[currentRankIdx];
    const nextRankInfo = currentRankIdx > 0 ? RANKS[currentRankIdx - 1] : null;

    const maxScore = nextRankInfo ? nextRankInfo.min : 6000;
    const pointsToNext = nextRankInfo ? nextRankInfo.min - rawScore : 0;
    const isMaxed = !nextRankInfo;

    const levelProgressRaw = nextRankInfo ? ((rawScore - currentRank.min) / (nextRankInfo.min - currentRank.min) * 100) : 100;
    const levelProgress = `${Math.min(100, Math.max(0, levelProgressRaw))}%`;

    const isVisionaryCard = rawScore >= 5000;

    return {
      isVisionary: isVisionaryCard,
      title: currentRank.name,
      score: rawScore.toLocaleString(),
      maxScore: maxScore.toLocaleString(),
      created: isVisionaryCard ? '156' : hash * 2 + 10,
      made: isVisionaryCard ? '842' : hash * 8 + 40,
      correct: isVisionaryCard ? '642' : hash * 5 + 20,
      incorrect: isVisionaryCard ? '200' : hash * 3 + 20,
      accuracy: isVisionaryCard ? '76.2%' : (hash > 6 ? '72.5%' : '67.2%'),
      forecastRating: isVisionaryCard ? '3,842' : (hash * 150 + 1100).toLocaleString(),
      percentile: isVisionaryCard ? 'Top 1% of Predictors' : `Top ${hash * 2 + 5}% of Predictors`,
      levelProgress: levelProgress,
      pointsToNext: pointsToNext,
      nextRank: nextRankInfo ? nextRankInfo.name : 'Max Rank',
      isMaxed: isMaxed,
      ratingColor: isVisionaryCard ? 'text-amber-300' : 'text-indigo-200',
      ratingText: isVisionaryCard ? 'text-amber-100' : 'text-indigo-100',
      ratingBg: isVisionaryCard ? 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-indigo-500/20',
      ratingBorder: isVisionaryCard ? 'border-amber-400/30' : 'border-indigo-400/20',
      cardGradient: isVisionaryCard ? 'bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-yellow-500/10' : 'bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-purple-500/10',
      cardBorder: isVisionaryCard ? 'border-amber-400/30' : 'border-indigo-400/30',
      cardShadow: isVisionaryCard ? 'shadow-[0_8px_32px_rgba(245,158,11,0.2)]' : 'shadow-[0_8px_32px_rgba(79,70,229,0.2)]',
      cardGlow: isVisionaryCard ? 'bg-amber-500/10 group-hover:bg-amber-500/20' : 'bg-indigo-500/10 group-hover:bg-indigo-500/30',
      progressGradient: isVisionaryCard ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
    };
  };

  const stats = getStats(name, aura);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full flex flex-col h-full overflow-y-auto no-scrollbar scroll-smooth pb-32"
    >
      {/* Profile Details */}
      <div className="px-6 flex flex-col gap-5 pt-8 relative z-10">
        <div className="flex w-full justify-between items-center mb-1">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group border border-white/10 rounded-full px-4 py-2 hover:bg-white/5 bg-black/40 outline-none tap-highlight-transparent">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {/* Header Row: Name Context & Settings */}
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-1">
              {isEditingName ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameSave}
                    autoFocus
                    className="bg-transparent text-[40px] font-black text-white leading-none border-b-2 border-white/50 w-full outline-none"
                  />
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded w-fit border border-orange-500/20 shadow-sm mt-1">
                    Display name can only be changed once
                  </span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <h1 className="text-[40px] font-black leading-none tracking-tight text-white drop-shadow-md">
                      {name}
                    </h1>
                    <BadgeCheck size={32} className="text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
                  </div>
                  <span className="text-white/50 font-medium tracking-wide mt-1">{username || '@username'}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!hasChangedName && !isEditingName && !isReadOnly && (
                <button onClick={() => setIsEditingName(true)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white border border-white/10">
                  <Edit2 size={18} />
                </button>
              )}
              {!isReadOnly && (
                <button onClick={onOpenSettings} className="p-3 bg-white/[0.05] border border-white/[0.05] backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                  <Settings size={18} />
                </button>
              )}
            </div>
          </div>

          {/* City (Auto-detected) */}
          <div className="flex items-center gap-2 text-white/50 -mt-2">
            <MapPin size={16} />
            <span className="text-[16px] tracking-wide font-medium">{city || 'Location Unknown'}</span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex gap-3 mt-2">
          {[
            { label: 'Following', icon: User },
            { label: 'Followers', icon: Users },
            { label: 'Badges', icon: Award }
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => action.label === 'Badges' ? onOpenBadges() : onOpenNetwork(action.label)}
              className="flex-1 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex flex-col items-center gap-2 hover:bg-white/[0.06] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] outline-none"
            >
              <action.icon size={20} className="text-white/60" />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/50">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-white/40" />
              <h2 className="text-[14px] font-bold tracking-[0.2em] uppercase text-white/40">Performance</h2>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenMetrics?.(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white"
            >
              <Info size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Metrics Guide</span>
            </button>
          </div>

          {/* Aura Level Lead Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenRating}
            className={`w-full text-left ${stats.cardGradient} border ${stats.cardBorder} rounded-[2rem] p-6 relative overflow-hidden group ${stats.cardShadow} outline-none ${stats.isVisionary ? 'ring-1 ring-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.3)]' : ''}`}
          >
            {stats.isVisionary && (
              <>
                {/* Active ambient pulsing aura */}
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-amber-500/30 blur-2xl pointer-events-none"
                />

                {/* Diagonal light sweep (shimmer) */}
                <motion.div
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg] z-0 pointer-events-none blur-[2px]"
                />
              </>
            )}

            <div className={`absolute inset-0 ${stats.cardGlow} blur-2xl transition-colors duration-500 pointer-events-none`} />
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className={`${stats.ratingColor} drop-shadow-md`} />
                  <span className={`text-[12px] font-bold tracking-[0.2em] uppercase ${stats.ratingColor} drop-shadow-md`}>Aura Points</span>
                </div>
                <span className={`text-[10px] font-bold tracking-wider ${stats.ratingColor} ${stats.ratingBg} px-2.5 py-1 rounded-full border ${stats.ratingBorder}`}>
                  {stats.percentile}
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <span className={`text-[15px] font-bold ${stats.ratingText} drop-shadow-sm px-1`}>
                  {stats.title}
                </span>
                <div className="flex items-baseline gap-2 px-1 mb-1">
                  <span className="text-[42px] font-black text-white leading-none tracking-tighter drop-shadow-xl">{stats.score}</span>
                  <span className="text-[16px] font-bold text-white/30">/ {stats.maxScore}</span>
                </div>

                {/* Level Up Progress Bar */}
                <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] my-2 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: stats.levelProgress }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                    className={`h-full ${stats.progressGradient} rounded-full`}
                  />
                  {stats.isMaxed && (
                    <motion.div
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-30deg]"
                    />
                  )}
                </div>

                <span className="text-[12px] font-medium text-white/50 tracking-wide text-right px-1">
                  {stats.isMaxed ? (
                    <span className={`${stats.ratingColor} font-bold tracking-widest uppercase text-[10px]`}>Maximum Rank Achieved</span>
                  ) : (
                    <>{stats.pointsToNext.toLocaleString()} points to <span className={`${stats.ratingColor} font-bold`}>{stats.nextRank}</span></>
                  )}
                </span>
              </div>
            </div>
          </motion.button>

          <div className="flex gap-4">
            <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col border-t-white/[0.08]">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/40 mb-1">Predictions Created</span>
              <span className="text-[28px] font-black text-white">{stats.created}</span>
            </div>
            <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col border-t-white/[0.08]">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/40 mb-1">Predictions Made</span>
              <span className="text-[28px] font-black text-white">{stats.made}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={24} className="text-green-400 mb-3" />
              <span className="text-[24px] font-black text-white leading-none mb-1">{stats.correct}</span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40">Correct</span>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col items-center justify-center text-center">
              <XCircle size={24} className="text-red-400 mb-3" />
              <span className="text-[24px] font-black text-white leading-none mb-1">{stats.incorrect}</span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40">Incorrect</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Accuracy */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group shadow-[0_4px_20px_rgba(79,70,229,0.1)]">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
              <Target size={24} className="text-indigo-400/40 relative z-10 mb-3" />
              <div className="relative z-10 flex flex-col gap-1">
                <span className="text-[28px] font-black text-white leading-none tracking-tight">{stats.accuracy}</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300">Accuracy</span>
              </div>
            </div>

            {/* Forecast Rating */}
            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group shadow-[0_4px_20px_rgba(139,92,246,0.1)]">
              <div className="absolute inset-0 bg-violet-500/10 blur-xl group-hover:bg-violet-500/20 transition-colors pointer-events-none" />
              <TrendingUp size={24} className="text-violet-400/40 relative z-10 mb-3" />
              <div className="relative z-10 flex flex-col gap-1">
                <span className="text-[28px] font-black text-white leading-none tracking-tight">{stats.forecastRating}</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-violet-300">Forecast Rating</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col items-center justify-center border-t-orange-500/20 shadow-[inset_0_2px_10px_rgba(249,115,22,0.05)]">
              <span className="text-[28px] font-black text-white flex items-center gap-2 mb-1">
                4 <Flame size={20} className="text-orange-400" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/40 text-center text-balance">Current Streak</span>
            </div>
            <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col items-center justify-center border-t-yellow-500/20 shadow-[inset_0_2px_10px_rgba(234,179,8,0.05)]">
              <span className="text-[28px] font-black text-white flex items-center gap-2 mb-1">
                12 <Crown size={20} className="text-yellow-400" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/40 text-center text-balance">Longest Streak</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div >
  );
};

const ActivityScreen = () => {
  const activities = [
    { id: 1, type: 'reply', user: 'Seth', details: 'replied to your comment on "Will AGI be announced before 2030?"', time: '2h', icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 2, type: 'like', user: 'Ashpak', details: 'liked your comment', time: '5h', icon: CheckCircle2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: 3, type: 'vote', user: 'KVD', details: 'voted YES on your prediction', time: '1d', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 4, type: 'follow', user: 'Ekansh', details: 'started following you', time: '2d', icon: User, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full flex flex-col h-full pt-10 pb-48 overflow-y-auto no-scrollbar scroll-smooth px-6"
    >
      <div className="flex flex-col mb-8">
        <h1 className="text-[40px] leading-[1.05] font-bold text-white/95 tracking-tight text-balance">
          Activity
        </h1>
        <div className="text-white/40 text-[12px] font-bold tracking-[0.25em] uppercase mt-2 flex items-center gap-2">
          <ActivityIcon size={14} className="text-emerald-400" />
          Recent Interactions
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {activities.map((act) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] p-4 shadow-[inset_0_1px_10px_rgba(0,0,0,0.2)]"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.bg}`}>
              <act.icon size={18} className={act.color} />
            </div>
            <div className="flex flex-col flex-1 pl-1">
              <span className="text-[14px] leading-tight text-white/80 font-medium tracking-wide">
                <strong className="text-white font-black drop-shadow-sm">{act.user}</strong> {act.details}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-2">
                {act.time} ago
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Assuming Activity is imported as ActivityIcon natively earlier but aliased or standard Activity works
const ActivityIcon = Activity;

const CommentItem = ({ comment, allComments, onReply, onLike, likedComments, onUserClick, depth = 0 }) => {
  const children = allComments.filter(c => c.parentId === comment.id);

  return (
    <div className={`flex flex-col ${depth > 0 ? 'ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-white/10 mt-3' : 'mt-5'}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <User size={14} className="text-white/70" />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start">
            <div className="flex flex-col flex-1 pr-4">
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-white text-[13px] hover:underline cursor-pointer"
                  onClick={() => onUserClick?.({ name: comment.user, username: `@${comment.user.toLowerCase().replace(/\s+/g, '')}`, aura: comment.aura })}
                >
                  {comment.user}
                </span>
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{comment.time}</span>
              </div>
              <p className="text-white/80 text-[14px] leading-relaxed mt-1 whitespace-pre-wrap break-words">
                {comment.text}
              </p>
              <button
                onClick={() => onReply(comment)}
                className="text-[11px] font-bold text-white/40 hover:text-white mt-2 w-max transition-colors"
              >
                Reply
              </button>
            </div>

            <div className="flex flex-col items-center gap-1.5 mt-1 relative z-10">
              <button
                onClick={() => onLike(comment.id)}
                className="text-white/40 hover:text-white transition-colors group p-1"
              >
                <motion.div
                  animate={likedComments[comment.id] ? { scale: [1, 1.5, 1] } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Heart
                    size={15}
                    className={`transition-colors ${likedComments[comment.id] ? 'fill-red-500 text-red-500 hover:fill-red-400 hover:text-red-400' : 'group-hover:scale-110 group-active:scale-90'}`}
                  />
                </motion.div>
              </button>
              <span className={`text-[10px] font-bold transition-colors ${likedComments[comment.id] ? 'text-red-500' : 'text-white/40'}`}>
                {comment.likes + (likedComments[comment.id] ? 1 : 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {children.map(child => (
        <CommentItem
          key={child.id}
          comment={child}
          allComments={allComments}
          onReply={onReply}
          onLike={onLike}
          likedComments={likedComments}
          onUserClick={onUserClick}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

const CommentsModal = ({ isOpen, onClose, prediction, onUserClick }) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [comments, setComments] = useState([
    { id: 1, parentId: null, user: 'Ashpak', text: 'This is actually very possible given the current pace!', time: '2h', likes: 142, aura: 1600 },
    { id: 2, parentId: null, user: 'Ekansh', text: 'Nah, timeline is too short. There are hardware bottlenecks.', time: '5h', likes: 38, aura: 2100 },
    { id: 3, parentId: 1, user: 'KVD', text: 'Totally agree, the architectural shifts are compounding quickly.', time: '1h', likes: 24, aura: 4500 }
  ]);
  const [likedComments, setLikedComments] = useState({});
  const inputRef = React.useRef(null);

  const handlePost = () => {
    if (newComment.trim()) {
      setComments([{
        id: Date.now(),
        parentId: replyingTo ? replyingTo.id : null,
        user: 'Srikant',
        text: newComment,
        time: 'Just now',
        likes: 0,
        aura: 5420
      }, ...comments]);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const toggleLike = (id) => {
    setLikedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full h-[75vh] bg-black/60 backdrop-blur-3xl border-t border-white/[0.15] rounded-t-[2.5rem] z-[101] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-full flex justify-center py-4">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Comments ({comments.length})</h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 flex flex-col pb-6">
              {comments.filter(c => c.parentId === null).map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  allComments={comments}
                  onReply={handleReply}
                  onLike={toggleLike}
                  likedComments={likedComments}
                  onUserClick={onUserClick}
                />
              ))}
            </div>

            <div className="flex flex-col border-t border-white/5 bg-white/[0.02]">
              {replyingTo && (
                <div className="flex justify-between items-center px-6 py-2 bg-indigo-500/10 border-b border-indigo-500/20">
                  <span className="text-[11px] font-bold text-indigo-300">Replying to {replyingTo.user}</span>
                  <button onClick={() => setReplyingTo(null)} className="text-indigo-400 hover:text-indigo-300">
                    <XCircle size={14} />
                  </button>
                </div>
              )}
              <div className="p-4 pb-8">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 pl-4 focus-within:border-white/30 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                    className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/40"
                  />
                  <button
                    onClick={handlePost}
                    disabled={!newComment.trim()}
                    className="p-2 bg-indigo-500 rounded-full text-white disabled:opacity-50 disabled:bg-white/10 transition-colors"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};



const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(59);

  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    let timer;
    if (step === 'otp' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    if (step === 'loading') {
      const t = setTimeout(() => {
        setStep('profile');
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'saving') {
      const t = setTimeout(() => {
        setStep('success');
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(() => {
        onComplete({ displayName, username, city, age });
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [step, onComplete, displayName, username, city, age]);

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    if (newOtp.every(v => v !== '') && index === 5) {
      setTimeout(() => setStep('loading'), 100);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      if (pastedData.length === 6) {
        setTimeout(() => setStep('loading'), 100);
        const lastInput = document.getElementById(`otp-5`);
        if (lastInput) lastInput.focus();
      } else {
        const nextInput = document.getElementById(`otp-${pastedData.length}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const isSuccess = step === 'success';
  const isPhoneMode = email.length > 0 && /^[0-9\s-]*$/.test(email);
  const isValidContact = (email.includes('@') && email.includes('.')) || (isPhoneMode && email.replace(/[^0-9]/g, '').length >= 7);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden w-full max-w-[480px] mx-auto bg-[#020202]`}
    >
      <AmbientBackground />

      <motion.div
        layout
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className={`w-full flex flex-col z-10 transition-all duration-700 items-center justify-center h-full`}
      >
        {!isSuccess && (
          <motion.div layout className="w-full relative py-12 px-6 flex flex-col items-center justify-center bg-white/[0.02] backdrop-blur-[8px]">
            {/* Top Separator with Subtle Fire Aura */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent">
              {/* Core glow */}
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.6)] mix-blend-screen pointer-events-none"
              />
              {/* Soft pulsating flame aura */}
              <motion.div
                animate={{
                  opacity: [0.1, 0.4, 0.1],
                  scaleY: [0.8, 1.2, 0.8],
                  filter: ['blur(15px)', 'blur(25px)', 'blur(15px)']
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-[30px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent mix-blend-screen pointer-events-none"
              />
            </div>

            {/* Bottom Separator with Subtle Fire Aura */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent">
              {/* Core glow */}
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_15px_rgba(139,92,246,0.6)] mix-blend-screen pointer-events-none"
              />
              {/* Soft pulsating flame aura */}
              <motion.div
                animate={{
                  opacity: [0.1, 0.4, 0.1],
                  scaleY: [0.8, 1.2, 0.8],
                  filter: ['blur(15px)', 'blur(25px)', 'blur(15px)']
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-[30px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent mix-blend-screen pointer-events-none"
              />
            </div>

            <div className="flex items-center gap-6 mb-12 mt-4 group relative z-10">
              <VisionIcon size={52} className="text-white/90 group-hover:text-white transition-colors" />
              <div className="w-px h-10 bg-white/10" />
              <span className="text-[40px] font-medium tracking-[0.35em] text-white/90 group-hover:text-white transition-colors">
                VISION
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {(step === 'email' || step === 'otp' || step === 'loading') && (
                <motion.div key="accordion" layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5 w-full max-w-[400px]">

                  {/* Step 2: Email */}
                  <motion.div layout className={`flex flex-col bg-black/40 border border-white/[0.08] rounded-[1.5rem] p-6 overflow-hidden transition-all duration-500 ${step === 'email' ? 'shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30' : 'opacity-40'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${step === 'email' ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]' : 'bg-white/10 text-white'}`}>
                        {step === 'email' ? <User size={20} /> : <Check size={18} />}
                      </div>
                      <h2 className={`font-bold text-white tracking-wide transition-all duration-500 ${step === 'email' ? 'text-[20px]' : 'text-[16px]'}`}>Setup Account</h2>
                    </div>
                    <AnimatePresence>
                      {step === 'email' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-5 mt-6">
                          <p className="text-white/40 text-[14px] font-medium leading-relaxed">Enter your email or phone to receive a secure code.</p>
                          <div className="flex gap-3 w-full relative">
                            <AnimatePresence>
                              {isPhoneMode && (
                                <motion.select
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: 90, opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  value={countryCode}
                                  onChange={(e) => setCountryCode(e.target.value)}
                                  className="bg-black/50 border border-white/10 rounded-[1rem] px-3 py-4 text-[16px] font-bold tracking-wide text-white outline-none focus:border-indigo-400 focus:bg-indigo-500/5 transition-all text-center appearance-none cursor-pointer hover:bg-white/5"
                                >
                                  <option value="+91">IN (+91)</option>
                                  <option value="+1">US (+1)</option>
                                  <option value="+44">UK (+44)</option>
                                  <option value="+61">AU (+61)</option>
                                  <option value="+49">DE (+49)</option>
                                  <option value="+33">FR (+33)</option>
                                  <option value="+81">JP (+81)</option>
                                  <option value="+86">CN (+86)</option>
                                  <option value="+55">BR (+55)</option>
                                  <option value="+971">AE (+971)</option>
                                  <option value="+65">SG (+65)</option>
                                  <option value="+27">ZA (+27)</option>
                                  <option value="+7">RU (+7)</option>
                                  <option value="+82">KR (+82)</option>
                                  <option value="+39">IT (+39)</option>
                                </motion.select>
                              )}
                            </AnimatePresence>
                            <input
                              type="text"
                              placeholder="Email or Phone number"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full flex-1 bg-black/50 border border-white/10 rounded-[1rem] px-5 py-4 text-[16px] font-medium tracking-wide text-white outline-none focus:border-indigo-400 focus:bg-indigo-500/5 transition-all placeholder:text-white/20"
                              autoFocus
                            />
                          </div>
                          <button onClick={() => setStep('otp')} disabled={!isValidContact} className="w-full bg-indigo-500 text-white font-bold py-4 rounded-[1rem] text-[16px] shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] hover:bg-indigo-400 transition-all active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none mt-2 outline-none">
                            Continue
                          </button>

                          <div className="flex items-center gap-4 my-2">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-white/30 text-[12px] font-bold uppercase tracking-wider">Or</span>
                            <div className="flex-1 h-px bg-white/10" />
                          </div>

                          <div className="flex gap-4">
                            <button className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-[1rem] text-[14px] hover:bg-white/10 transition-all active:scale-95 flex justify-center items-center gap-2">
                              {/* Simple Google G SVG */}
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                              </svg>
                              Google
                            </button>
                            <button className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-[1rem] text-[14px] hover:bg-white/10 transition-all active:scale-95 flex justify-center items-center gap-2">
                              {/* Simple Apple SVG */}
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.25.68 2.92.68.65 0 1.69-.76 3.23-.65 1.3.06 2.4.45 3.19 1.15-2.3 1.34-1.93 4.21.32 5.09-1.04 2.76-2.48 5-4.22 6.7M12.03 7.25c-.24-2.22 1.63-4.05 3.31-4.25.32 2.37-2.02 4.1-3.31 4.25z" />
                              </svg>
                              Apple
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Step 3: OTP */}
                  {(step === 'otp' || step === 'loading') && (
                    <motion.div layout className={`flex flex-col bg-black/40 border border-white/[0.08] rounded-[1.5rem] p-6 overflow-hidden transition-all duration-500 ${step === 'otp' ? 'shadow-[0_0_30px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${step === 'otp' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]' : 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]'}`}>
                          {step === 'loading' ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
                        </div>
                        <h2 className={`font-bold text-white tracking-wide transition-all duration-500 ${step === 'loading' ? 'text-[16px]' : 'text-[20px]'}`}>
                          {step === 'loading' ? 'Creating Account...' : (isPhoneMode ? 'Verify Phone' : 'Verify Email')}
                        </h2>
                      </div>
                      <AnimatePresence>
                        {step === 'otp' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-6 mt-5">
                            <p className="text-white/40 text-[13px] font-medium leading-relaxed">We've sent a 6-digit code to <span className="text-white font-bold">{email}</span></p>
                            <div className="flex justify-between w-full gap-2">
                              {otp.map((digit, i) => (
                                <input
                                  key={i}
                                  id={`otp-${i}`}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(i, e.target.value)}
                                  onPaste={handlePaste}
                                  className="w-10 h-10 bg-black/50 border border-white/10 rounded-[0.5rem] text-center text-[18px] font-bold text-white outline-none focus:border-purple-400 focus:bg-purple-500/10 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all shadow-inner"
                                  autoFocus={i === 0}
                                />
                              ))}
                            </div>
                            <button className="text-purple-400 font-bold text-[12px] w-fit hover:text-purple-300 transition-colors outline-none cursor-pointer">
                              {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend code'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                </motion.div>
              )}

              {/* Step 4: Profile Details */}
              {(step === 'profile' || step === 'saving') && (
                <motion.div key="profile" layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-5 w-full max-w-[400px]">
                  <motion.div layout className={`flex flex-col bg-black/40 border border-white/[0.08] rounded-[1.5rem] p-6 overflow-hidden transition-all duration-500 shadow-[0_0_30px_rgba(56,189,248,0.15)] ring-1 ring-sky-500/30`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 bg-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.6)]`}>
                        {step === 'saving' ? <Loader2 size={20} className="animate-spin" /> : <User size={20} />}
                      </div>
                      <h2 className="font-bold text-white tracking-wide text-[20px]">
                        {step === 'saving' ? 'Creating Identity...' : 'Profile Details'}
                      </h2>
                    </div>

                    <div className="flex flex-col gap-4 relative z-10 w-full">
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[12px] font-bold tracking-widest text-white/40 uppercase ml-2">Display Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Srikant"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-[1rem] px-5 py-3.5 text-[16px] font-medium tracking-wide text-white outline-none focus:border-sky-400 focus:bg-sky-500/5 transition-all placeholder:text-white/20"
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-[12px] font-bold tracking-widest text-white/40 uppercase ml-2">Username</label>
                        <input
                          type="text"
                          placeholder="e.g. @srikant_v"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-[1rem] px-5 py-3.5 text-[16px] font-medium tracking-wide text-white outline-none focus:border-sky-400 focus:bg-sky-500/5 transition-all placeholder:text-white/20"
                        />
                      </div>
                      <div className="flex gap-4 w-full">
                        <div className="flex flex-col gap-1.5 flex-[2]">
                          <label className="text-[12px] font-bold tracking-widest text-white/40 uppercase ml-2">City</label>
                          <input
                            type="text"
                            placeholder="e.g. New York"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-[1rem] px-5 py-3.5 text-[16px] font-medium tracking-wide text-white outline-none focus:border-sky-400 focus:bg-sky-500/5 transition-all placeholder:text-white/20"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-[1]">
                          <label className="text-[12px] font-bold tracking-widest text-white/40 uppercase ml-2">Age</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="e.g. 24"
                            value={age}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[0-9\b]+$/.test(val)) {
                                setAge(val);
                              }
                            }}
                            className="w-full bg-black/50 border border-white/10 rounded-[1rem] px-5 py-3.5 text-[16px] font-medium tracking-wide text-white outline-none focus:border-sky-400 focus:bg-sky-500/5 transition-all placeholder:text-white/20 text-center"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setStep('saving')}
                        disabled={!displayName || !username || !city || !age || step === 'saving'}
                        className="w-full bg-sky-500 text-white font-bold py-4 rounded-[1rem] text-[16px] shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-[1.02] hover:bg-sky-400 transition-all active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none mt-4 outline-none"
                      >
                        Proceed
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {isSuccess && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center w-full h-full relative z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
              animate={{
                scale: [0.8, 1.2, 50],
                opacity: [0, 1, 0],
                filter: ['blur(10px)', 'blur(0px)', 'blur(20px)']
              }}
              transition={{ duration: 1.5, times: [0, 0.5, 1], ease: "easeInOut" }}
              className="text-violet-500 drop-shadow-[0_0_60px_rgba(139,92,246,1)]"
            >
              <VisionIcon size={120} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const [navHistory, setNavHistory] = useState([{ tab: 'home', profile: null }]);
  const [isLogoGlowing, setIsLogoGlowing] = useState(false);
  const activeNav = navHistory[navHistory.length - 1];
  const activeTab = activeNav.tab;
  const viewedProfile = activeNav.profile;

  const navigateTo = (tab, profile = null) => {
    setNavHistory(prev => [...prev, { tab, profile }]);
  };

  const goBack = () => {
    setNavHistory(prev => prev.length <= 1 ? prev : prev.slice(0, -1));
  };

  const resetNav = (tab) => {
    setNavHistory([{ tab, profile: null }]);
  };

  // Lifted Profile State
  const [userName, setUserName] = useState('Srikant');
  const [userAura, setUserAura] = useState(5420);
  const [userHandle, setUserHandle] = useState('');
  const [userCity, setUserCity] = useState('');
  const [hasChangedName, setHasChangedName] = useState(false);

  // Social State
  const [likedPredictions, setLikedPredictions] = useState({});
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [networkType, setNetworkType] = useState('Following');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);

  const currentPrediction = PREDICTIONS[currentIndex];
  const isLiked = likedPredictions[currentPrediction.id];

  const toggleLike = () => {
    setLikedPredictions(prev => ({
      ...prev,
      [currentPrediction.id]: !prev[currentPrediction.id]
    }));
  };

  const handleUserClick = (userProfile) => {
    setIsNetworkModalOpen(false);
    setIsCommentsModalOpen(false);
    navigateTo('profile', userProfile);
  };

  const openNetworkInfo = (type) => {
    if (type === 'Badges') return;
    setNetworkType(type);
    setIsNetworkModalOpen(true);
  };

  const handleLogoClick = () => {
    setIsLogoGlowing(true);
    setTimeout(() => {
      setIsLogoGlowing(false);
    }, 1000); // the intense glow lasts 1 second then smoothly rests back 
  };

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

  const handleShare = async () => {
    const badge = RISK_BADGES[currentPrediction.riskLevel || 'safe'];
    const text = `� Prediction on VISION [${badge.label}]\n\n${currentPrediction.question}\n\nYES ${currentPrediction.yesPercent}%\nNO ${currentPrediction.noPercent}%`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'VISION Prediction',
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Prediction copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#020202] text-white flex justify-center w-full font-sans selection:bg-indigo-500/30">
      {showOnboarding && (
        <OnboardingScreen onComplete={(profileData) => {
          if (profileData && profileData.displayName) {
            setUserName(profileData.displayName);
            if (profileData.username) {
              setUserHandle(profileData.username.startsWith('@') ? profileData.username : `@${profileData.username}`);
            }
            if (profileData.city) {
              setUserCity(profileData.city);
            }
          }
          setShowOnboarding(false);
        }} />
      )}

      <div
        className={`w-full max-w-[480px] relative h-[100dvh] overflow-hidden border-x border-white/[0.04] bg-[#020202] flex flex-col shadow-2xl transition-opacity duration-1000 ${showOnboarding ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
          }`}
      >
        <AmbientBackground />

        <header className="relative z-40 pt-10 px-6">
          <div className="flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isLogoGlowing ? 0.96 : 1,
                filter: isLogoGlowing
                  ? "drop-shadow(0px 0px 80px rgba(255, 255, 255, 1)) drop-shadow(0px 0px 40px rgba(255, 255, 255, 0.8))"
                  : "drop-shadow(0px 0px 15px rgba(255, 255, 255, 0.2))"
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={!isLogoGlowing ? {
                scale: 1.02,
                filter: "drop-shadow(0px 0px 30px rgba(255, 255, 255, 0.5))"
              } : {}}
              onClick={handleLogoClick}
              className="flex items-center gap-5 mt-1 group cursor-pointer transition-all duration-300"
            >
              <VisionIcon size={44} className="text-white/90 group-hover:text-white transition-colors duration-300" />
              <div className="w-px h-10 bg-white/10 group-hover:bg-white/40 transition-colors duration-300" />
              <span className="text-[32px] font-medium tracking-[0.35em] text-white/90 group-hover:text-white group-active:text-white transition-colors duration-300 translate-x-1">
                VISION
              </span>
            </motion.div>
          </div>
        </header>

        <main className={`relative z-20 flex-1 flex flex-col min-h-0 ${activeTab === 'predict' ? 'justify-center px-4 pb-28' : ''}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isPulsing ? 1 : 0, scale: isPulsing ? 1.4 : 0.8 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] ${selectedVote === 'yes' ? 'bg-green-500/20' : selectedVote === 'no' ? 'bg-red-500/20' : 'bg-indigo-500/20'} blur-[100px] rounded-full pointer-events-none z-10`}
          />

          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <HomeDiscoveryScreen key="home" userName={userName} onPredictPress={() => navigateTo('predict')} />
            ) : activeTab === 'predict' ? (
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

                  {navHistory.length > 1 && (
                    <button onClick={goBack} className="absolute -top-14 left-0 flex items-center gap-2 text-white/50 hover:text-white transition-colors group border border-white/10 rounded-full px-4 py-2 hover:bg-white/5 bg-black/40 outline-none tap-highlight-transparent z-50">
                      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
                    </button>
                  )}

                  <div className="flex justify-between items-start mb-10 relative z-10 w-full px-1">
                    {(() => {
                      const badge = RISK_BADGES[currentPrediction.riskLevel || 'safe'];
                      const BadgeIcon = badge.icon;
                      return (
                        <div className="flex flex-col gap-3">
                          <motion.div
                            key={currentPrediction.id + badge.label}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] ${badge.color} ${badge.shadow} ${badge.bg} px-3 py-1.5 rounded-full border ${badge.border} h-fit w-fit`}
                          >
                            <BadgeIcon size={14} className={badge.color} />
                            <span>{badge.label}</span>
                          </motion.div>
                          <div
                            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleUserClick({ name: currentPrediction.creator, username: `@${currentPrediction.creator.toLowerCase().replace(/\s/g, '')}`, aura: currentPrediction.creatorAura || 1200 })}
                          >
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                              <User size={10} className="text-white/70" />
                            </div>
                            <span className="text-[12px] font-bold text-white/70 tracking-wide mt-0.5">
                              {currentPrediction.creator}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex flex-col items-end gap-1.5 text-[11px] text-white/50 font-medium tracking-wide">
                      <div className="flex items-center gap-2">
                        <span>{currentPrediction.total} predictions</span>
                        <Users size={12} className="text-white/40" />
                      </div>
                      <div className="w-full h-px bg-white/10" />
                      <div className="flex items-center gap-2">
                        <span>{currentPrediction.resolvesIn} left</span>
                        <Clock size={12} className="text-white/40" />
                      </div>
                    </div>
                  </div>

                  <h1 className={`relative z-10 font-semibold leading-[1.05] tracking-tighter text-center text-white/95 mb-14 text-balance drop-shadow-2xl ${['hot_take', 'crazy'].includes(currentPrediction.riskLevel) ? 'text-[40px]' : 'text-[46px]'
                    }`}
                  >
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

                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center gap-2 mt-5 py-2 px-4 rounded-full bg-white/[0.03] border border-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.2)] w-max mx-auto"
                    >
                      <Sparkles size={14} className="text-violet-400" />
                      <span className="text-[12px] font-medium text-white/70">
                        Potential Win: <span className="text-violet-300 font-bold">{currentPrediction.potentialAura} Aura</span>
                      </span>
                    </motion.div>
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
                          className="absolute inset-0 bg-green-500/40 rounded-full pointer-events-none"
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
                          className="absolute inset-0 bg-red-500/40 rounded-full pointer-events-none"
                        />
                      )}
                      <div
                        className="absolute inset-0 rounded-[2rem] border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ clipPath: 'inset(0 0 80% 0)' }}
                      />
                    </motion.button>
                  </div>

                  <div className="relative z-10 w-full flex justify-between items-center mt-6 px-1">
                    <div className="flex gap-5 items-center">
                      <button onClick={toggleLike} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                        <motion.div
                          animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Heart size={18} className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500 hover:fill-red-400 hover:text-red-400' : 'group-hover:scale-110 group-active:scale-90'}`} />
                        </motion.div>
                        <span className={`text-[12px] font-bold transition-colors ${isLiked ? 'text-red-500' : ''}`}>{currentPrediction.likes + (isLiked ? 1 : 0)}</span>
                      </button>
                      <button onClick={() => setIsCommentsModalOpen(true)} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                        <MessageCircle size={18} className="group-hover:scale-110 transition-transform group-active:scale-90" />
                        <span className="text-[12px] font-bold">{currentPrediction.comments}</span>
                      </button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.1] shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-[11px] font-bold tracking-widest text-white/70 hover:text-white transition-all uppercase drop-shadow-md"
                    >
                      <Share2 size={16} />
                      Share
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ) : activeTab === 'create' ? (
              <CreatePredictionScreen key="create" onPublish={() => resetNav('home')} />
            ) : activeTab === 'leaderboard' ? (
              <LeaderboardScreen key="leaderboard" />
            ) : activeTab === 'activity' ? (
              <ActivityScreen key="activity" />
            ) : activeTab === 'profile' ? (
              <ProfileScreen
                key={`profile-${viewedProfile?.name || userName}`}
                name={viewedProfile ? viewedProfile.name : userName}
                setName={setUserName}
                username={viewedProfile ? viewedProfile.username : userHandle}
                city={viewedProfile ? (viewedProfile.city || '') : userCity}
                hasChangedName={hasChangedName}
                setHasChangedName={setHasChangedName}
                onOpenNetwork={openNetworkInfo}
                onOpenRating={() => setIsRatingModalOpen(true)}
                onOpenBadges={() => setIsBadgesModalOpen(true)}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onOpenMetrics={() => setIsMetricsModalOpen(true)}
                isReadOnly={!!viewedProfile}
                onBack={navHistory.length > 1 ? goBack : undefined}
                aura={viewedProfile ? viewedProfile.aura : userAura}
              />
            ) : null}
          </AnimatePresence>
        </main>

        {/* Liquid Glass Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-40 pb-8 px-6 pointer-events-none">
          <div className="pointer-events-auto flex justify-between items-center bg-white/[0.01] backdrop-blur-[10px] border border-white/[0.04] rounded-full p-2 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] relative">
            {BOTTOM_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => resetNav(tab.id)}
                  className={`relative z-10 flex items-center justify-center outline-none group tap-highlight-transparent transition-all duration-500 ease-out ${isActive ? 'px-5 py-3.5 w-auto' : 'flex-1 py-3.5'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-blob"
                      className={`absolute inset-0 rounded-full border backdrop-blur-md ${tab.glowClass}`}
                      transition={{ type: 'spring', stiffness: 480, damping: 35 }}
                    />
                  )}
                  <motion.div
                    className="relative z-20 flex items-center justify-center overflow-hidden mix-blend-difference"
                    animate={{
                      color: isActive ? tab.color : '#ffffff'
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
        <CommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => setIsCommentsModalOpen(false)}
          prediction={currentPrediction}
          onUserClick={handleUserClick}
        />
        <NetworkModal
          isOpen={isNetworkModalOpen}
          onClose={() => setIsNetworkModalOpen(false)}
          type={networkType}
          onUserClick={handleUserClick}
        />
        <RatingLadderModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
        />
        <BadgesModal
          isOpen={isBadgesModalOpen}
          onClose={() => setIsBadgesModalOpen(false)}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
        <MetricsModal
          isOpen={isMetricsModalOpen}
          onClose={() => setIsMetricsModalOpen(false)}
        />
      </div>
    </div>
  );
}
