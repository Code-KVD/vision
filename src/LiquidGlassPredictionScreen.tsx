import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  Compass,
  LayoutGrid,
  Plus,
  Sparkles,
  Timer,
  TrendingUp,
  Users2,
} from 'lucide-react-native';
import {
  LiquidGlassContainerView,
  LiquidGlassView,
  isLiquidGlassSupported,
} from '@callstack/liquid-glass';

type Vote = 'yes' | 'no' | null;

type Prediction = {
  id: number;
  question: string;
  yesPercent: number;
  noPercent: number;
  total: string;
  resolvesIn: string;
};

const PREDICTIONS: Prediction[] = [
  {
    id: 1,
    question: 'Will ChatGPT 6 be released in 2026?',
    yesPercent: 62,
    noPercent: 38,
    total: '12,431',
    resolvesIn: '287 days',
  },
  {
    id: 2,
    question: 'Will Neuralink achieve human trials outside US by 2025?',
    yesPercent: 45,
    noPercent: 55,
    total: '8,920',
    resolvesIn: '142 days',
  },
  {
    id: 3,
    question: 'Will AGI be officially announced by OpenAI before 2028?',
    yesPercent: 28,
    noPercent: 72,
    total: '45,102',
    resolvesIn: '1,204 days',
  },
];

const TABS = ['Feed', 'Leaderboard', 'Create'] as const;
const TAB_META = {
  Feed: { icon: LayoutGrid, label: 'Feed' },
  Leaderboard: { icon: TrendingUp, label: 'Leads' },
  Create: { icon: Plus, label: 'Create' },
} as const;

const glassFallback = !isLiquidGlassSupported
  ? ({ backgroundColor: 'rgba(255,255,255,0.12)' } as const)
  : null;

export default function LiquidGlassPredictionScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVote, setSelectedVote] = useState<Vote>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Feed');

  const prediction = useMemo(() => PREDICTIONS[currentIndex], [currentIndex]);

  const handleVote = (type: Exclude<Vote, null>) => {
    if (selectedVote) return;

    setSelectedVote(type);

    setTimeout(() => {
      setSelectedVote(null);
      setCurrentIndex((prev) => (prev + 1) % PREDICTIONS.length);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.bgOrbs} pointerEvents="none">
        <View style={[styles.orb, styles.orbA]} />
        <View style={[styles.orb, styles.orbB]} />
        <View style={[styles.orb, styles.orbC]} />
      </View>

      <LiquidGlassView
        style={[styles.topBar, glassFallback]}
        effect="regular"
        colorScheme="dark"
        interactive
        tintColor="rgba(129,140,248,0.16)"
      >
        <Text style={styles.brand}>VISION</Text>
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            const Icon = TAB_META[tab].icon;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.85}
                style={active ? styles.tabTouchActive : styles.tabTouchInactive}
              >
                <LiquidGlassView
                  style={[styles.tabPill, glassFallback, active && styles.tabPillActive]}
                  effect={active ? 'regular' : 'clear'}
                  colorScheme="dark"
                  tintColor={active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)'}
                >
                  <Icon size={16} color={active ? '#FFFFFF' : 'rgba(255,255,255,0.62)'} />
                  {active && (
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>
                      {TAB_META[tab].label}
                    </Text>
                  )}
                </LiquidGlassView>
              </TouchableOpacity>
            );
          })}
        </View>
      </LiquidGlassView>

      <View style={styles.main}>
        <LiquidGlassView
          style={[styles.card, glassFallback]}
          effect="regular"
          colorScheme="dark"
          tintColor="rgba(99,102,241,0.18)"
        >
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Timer size={14} color="rgba(255,255,255,0.72)" />
              <Text style={styles.metaText}>{prediction.resolvesIn} remaining</Text>
            </View>
            <View style={styles.metaItem}>
              <Users2 size={14} color="rgba(255,255,255,0.72)" />
              <Text style={styles.metaText}>{prediction.total} predictions</Text>
            </View>
          </View>

          <Text style={styles.question}>{prediction.question}</Text>

          <LiquidGlassView
            style={[styles.percentWrap, glassFallback]}
            effect="clear"
            colorScheme="dark"
            tintColor="rgba(255,255,255,0.08)"
          >
            <View style={styles.percentHeader}>
              <Text style={styles.yesLabel}>YES {prediction.yesPercent}%</Text>
              <Text style={styles.noLabel}>NO {prediction.noPercent}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${prediction.yesPercent}%` }]} />
            </View>
          </LiquidGlassView>

          <LiquidGlassContainerView spacing={14} style={styles.voteRow}>
            <TouchableOpacity style={styles.flex} onPress={() => handleVote('yes')} activeOpacity={0.9}>
              <LiquidGlassView
                style={[
                  styles.voteButton,
                  glassFallback,
                  styles.voteYes,
                  selectedVote === 'yes' && styles.voteSelected,
                  selectedVote === 'no' && styles.voteDim,
                ]}
                effect="regular"
                colorScheme="light"
                interactive
                tintColor="rgba(255,255,255,0.22)"
              >
                <Text style={styles.voteYesText}>YES {selectedVote === 'yes' ? '→' : ''}</Text>
              </LiquidGlassView>
            </TouchableOpacity>

            <TouchableOpacity style={styles.flex} onPress={() => handleVote('no')} activeOpacity={0.9}>
              <LiquidGlassView
                style={[
                  styles.voteButton,
                  glassFallback,
                  styles.voteNo,
                  selectedVote === 'no' && styles.voteSelected,
                  selectedVote === 'yes' && styles.voteDim,
                ]}
                effect="regular"
                colorScheme="dark"
                interactive
                tintColor="rgba(255,255,255,0.1)"
              >
                <Text style={styles.voteNoText}>NO {selectedVote === 'no' ? '→' : ''}</Text>
              </LiquidGlassView>
            </TouchableOpacity>
          </LiquidGlassContainerView>
        </LiquidGlassView>
      </View>

      <LiquidGlassContainerView spacing={12} style={styles.bottomDock}>
        {TABS.map((tab, idx) => {
          const active = activeTab === tab;
          const Icon =
            idx === 0 ? Compass : idx === 1 ? Sparkles : Bell;
          return (
            <TouchableOpacity
              key={`bottom-${tab}`}
              style={active ? styles.bottomTouchActive : styles.bottomTouchInactive}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.85}
            >
              <LiquidGlassView
                style={[styles.bottomItem, glassFallback, active && styles.bottomItemActive]}
                effect={active ? 'regular' : 'clear'}
                colorScheme="dark"
                interactive
                tintColor={active ? 'rgba(129,140,248,0.22)' : 'rgba(255,255,255,0.06)'}
              >
                <Icon size={18} color={active ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />
                {active && <Text style={[styles.bottomText, active && styles.bottomTextActive]}>{tab}</Text>}
              </LiquidGlassView>
            </TouchableOpacity>
          );
        })}
      </LiquidGlassContainerView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#06060B',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  bgOrbs: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.45,
  },
  orbA: {
    width: 360,
    height: 360,
    left: -120,
    top: -40,
    backgroundColor: 'rgba(79,70,229,0.35)',
  },
  orbB: {
    width: 320,
    height: 320,
    right: -140,
    top: 140,
    backgroundColor: 'rgba(29,78,216,0.3)',
  },
  orbC: {
    width: 300,
    height: 300,
    left: 70,
    bottom: 80,
    backgroundColor: 'rgba(147,51,234,0.24)',
  },
  topBar: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    color: '#F8FAFC',
    letterSpacing: 2.8,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 10,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tabTouchActive: {
    minWidth: 104,
  },
  tabTouchInactive: {
    width: 44,
  },
  tabPill: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabPillActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 36,
    padding: 22,
    gap: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    fontWeight: '500',
  },
  question: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.7,
    textAlign: 'center',
    marginVertical: 8,
  },
  percentWrap: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  percentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yesLabel: {
    color: '#E0E7FF',
    fontWeight: '700',
    fontSize: 12,
  },
  noLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontWeight: '700',
    fontSize: 12,
  },
  track: {
    width: '100%',
    height: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.44)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(129,140,248,0.95)',
  },
  voteRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  voteButton: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  voteYes: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  voteNo: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  voteSelected: {
    transform: [{ scale: 0.97 }],
  },
  voteDim: {
    opacity: 0.35,
  },
  voteYesText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  voteNoText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomDock: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    justifyContent: 'center',
  },
  bottomTouchActive: {
    minWidth: 130,
  },
  bottomTouchInactive: {
    width: 54,
  },
  bottomItem: {
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  bottomItemActive: {
    backgroundColor: 'rgba(129,140,248,0.24)',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 13,
  },
  bottomTextActive: {
    color: '#FFFFFF',
  },
});
