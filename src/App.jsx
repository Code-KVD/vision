import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ArrowRight, Menu, User, Home, Plus, Crown, Sparkles, Flame, Share2, Shield, Zap, Rocket, Check, Settings, Edit2, MessageCircle, Bell, Award, MapPin, Activity, CheckCircle2, XCircle, Target, TrendingUp, BadgeCheck, Heart } from 'lucide-react';

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

const ProfileScreen = ({ name, setName, hasChangedName, setHasChangedName }) => {
  const [city, setCity] = useState('Bengaluru');
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameSave = () => {
    if (name.trim()) {
      setIsEditingName(false);
      setHasChangedName(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full flex flex-col h-full overflow-y-auto no-scrollbar scroll-smooth pb-32"
    >
      {/* Profile Details */}
      <div className="px-6 flex flex-col gap-6 pt-12 relative z-10">
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
                  <span className="text-white/50 font-medium tracking-wide mt-1">@srikanthamsa</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!hasChangedName && !isEditingName && (
                <button onClick={() => setIsEditingName(true)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white border border-white/10">
                  <Edit2 size={18} />
                </button>
              )}
              <button className="p-3 bg-white/[0.05] border border-white/[0.05] backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* City (Auto-detected) */}
          <div className="flex items-center gap-2 text-white/50 -mt-2">
            <MapPin size={16} />
            <span className="text-[16px] tracking-wide font-medium">{city}</span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex gap-3 mt-2">
          {[
            { label: 'Following', icon: User },
            { label: 'Followers', icon: Users },
            { label: 'Badges', icon: Award }
          ].map((action, i) => (
            <button key={i} className="flex-1 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex flex-col items-center gap-2 hover:bg-white/[0.06] transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <action.icon size={20} className="text-white/60" />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/50">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-white/40" />
            <h2 className="text-[14px] font-bold tracking-[0.2em] uppercase text-white/40">Performance</h2>
          </div>

          {/* Forecast Rating Lead Card */}
          <div className="bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-purple-500/10 border border-indigo-400/30 rounded-[2rem] p-6 relative overflow-hidden group shadow-[0_8px_32px_rgba(79,70,229,0.2)]">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/30 transition-all duration-500 pointer-events-none" />
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.6)]" />
                  <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-indigo-300 drop-shadow-md">Forecast Rating</span>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-indigo-200 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-400/20">
                  Top 8% of Predictors
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[15px] font-bold text-indigo-100 drop-shadow-sm px-1">
                  Strategist
                </span>
                <div className="flex items-baseline gap-2 px-1 mb-1">
                  <span className="text-[42px] font-black text-white leading-none tracking-tighter drop-shadow-xl">1,420</span>
                  <span className="text-[16px] font-bold text-white/30">/ 1550</span>
                </div>

                {/* Level Up Progress Bar */}
                <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] my-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '13%' }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                  />
                </div>

                <span className="text-[12px] font-medium text-white/50 tracking-wide text-right px-1">
                  130 points to <span className="text-purple-300 font-bold">Sage</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col border-t-white/[0.08]">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/40 mb-1">Predictions Created</span>
              <span className="text-[28px] font-black text-white">42</span>
            </div>
            <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col border-t-white/[0.08]">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/40 mb-1">Predictions Made</span>
              <span className="text-[28px] font-black text-white">128</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={24} className="text-green-400 mb-3" />
              <span className="text-[24px] font-black text-white leading-none mb-1">86</span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40">Correct</span>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-3xl p-5 flex flex-col items-center justify-center text-center">
              <XCircle size={24} className="text-red-400 mb-3" />
              <span className="text-[24px] font-black text-white leading-none mb-1">42</span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40">Incorrect</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Accuracy */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group shadow-[0_4px_20px_rgba(79,70,229,0.1)]">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
              <Target size={24} className="text-indigo-400/40 relative z-10 mb-3" />
              <div className="relative z-10 flex flex-col gap-1">
                <span className="text-[28px] font-black text-white leading-none tracking-tight">67.2%</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-300">Accuracy</span>
              </div>
            </div>

            {/* Aura Points */}
            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20 rounded-3xl p-5 flex flex-col justify-center relative overflow-hidden group shadow-[0_4px_20px_rgba(139,92,246,0.1)]">
              <div className="absolute inset-0 bg-violet-500/10 blur-xl group-hover:bg-violet-500/20 transition-colors pointer-events-none" />
              <Sparkles size={24} className="text-violet-400/40 relative z-10 mb-3" />
              <div className="relative z-10 flex flex-col gap-1">
                <span className="text-[28px] font-black text-white leading-none tracking-tight">1,240</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-violet-300">Aura</span>
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
    </motion.div>
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

const CommentsModal = ({ isOpen, onClose, prediction }) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'Ashpak', text: 'This is actually very possible given the current pace!', time: '2h' },
    { id: 2, user: 'Ekansh', text: 'Nah, timeline is too short. There are hardware bottlenecks.', time: '5h' }
  ]);

  const handlePost = () => {
    if (newComment.trim()) {
      setComments([{ id: Date.now(), user: 'Srikant', text: newComment, time: 'Just now' }, ...comments]);
      setNewComment('');
    }
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

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User size={14} className="text-white/70" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-[13px]">{comment.user}</span>
                      <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{comment.time}</span>
                    </div>
                    <p className="text-white/80 text-[14px] leading-relaxed mt-1">
                      {comment.text}
                    </p>
                    <button className="text-[11px] font-bold text-white/40 hover:text-white mt-2 w-max transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.02] pb-8">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 pl-4">
                <input
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLogoGlowing, setIsLogoGlowing] = useState(false);

  // Lifted Profile State
  const [userName, setUserName] = useState('Srikant');
  const [hasChangedName, setHasChangedName] = useState(false);

  // Social State
  const [likedPredictions, setLikedPredictions] = useState({});
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  const currentPrediction = PREDICTIONS[currentIndex];
  const isLiked = likedPredictions[currentPrediction.id];

  const toggleLike = () => {
    setLikedPredictions(prev => ({
      ...prev,
      [currentPrediction.id]: !prev[currentPrediction.id]
    }));
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
      <div className="w-full max-w-[480px] relative h-[100dvh] overflow-hidden border-x border-white/[0.04] bg-[#020202] flex flex-col shadow-2xl">
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
              <HomeDiscoveryScreen key="home" userName={userName} onPredictPress={() => setActiveTab('predict')} />
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
                            onClick={() => setActiveTab('profile')}
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
              <CreatePredictionScreen key="create" onPublish={() => setActiveTab('home')} />
            ) : activeTab === 'leaderboard' ? (
              <LeaderboardScreen key="leaderboard" />
            ) : activeTab === 'activity' ? (
              <ActivityScreen key="activity" />
            ) : activeTab === 'profile' ? (
              <ProfileScreen
                key="profile"
                name={userName}
                setName={setUserName}
                hasChangedName={hasChangedName}
                setHasChangedName={setHasChangedName}
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
                  onClick={() => setActiveTab(tab.id)}
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
        />
      </div>
    </div>
  );
}
