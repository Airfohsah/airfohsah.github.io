import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IllustratedScreen, IllustratedHeader, GlowCard, GradientButton, OutlineButton } from '../components/illustrated';
import { difficultyColor, fonts, darkColors as colors } from '../constants/theme';
import { useToast } from '../components/ui';
import { useGameStore } from '../store/GameStore';

const ACCENTS = ['#3a7dff', '#a24bff', '#00c98a', '#ff5252', '#ff9c27', '#00c9c9', '#ff6bd6', '#7a8cff', '#ffb03a', '#5adba0'];

export default function CategoryScreen() {
  const router = useRouter();
  const { state, toggleCat, toggleAllCats } = useGameStore();
  const { message, showToast } = useToast();
  const [lockedCat, setLockedCat] = useState<string | null>(null);

  const words = state.words;
  const keys = Object.keys(words);
  const freeKeys = keys.filter((k) => !words[k].paid);
  const allFreeSelected = freeKeys.length > 0 && freeKeys.every((k) => state.selectedCats.includes(k));

  const goBack = () => {
    if (state.playMode === 'solo') router.push('/mode-select');
    else router.push('/players');
  };

  const next = () => {
    if (state.selectedCats.length === 0) {
      showToast('Pick at least one category first');
      return;
    }
    router.push('/round-setup');
  };

  return (
    <IllustratedScreen>
      <IllustratedHeader title="Pick" subtitle="categories" onBack={goBack} />
      <ScrollView contentContainerStyle={styles.grid}>
        <GlowCard
          accent={allFreeSelected ? colors.accent : 'rgba(255,255,255,0.15)'}
          selected={allFreeSelected}
          onPress={toggleAllCats}
          style={styles.allCard}
        >
          <Text style={styles.catIcon}>{'🌍'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.catName}>All Categories</Text>
            <Text style={styles.catCount}>Mix everything free</Text>
          </View>
          {allFreeSelected && <Text style={[styles.check, { color: colors.accent }]}>{'✓'}</Text>}
        </GlowCard>

        <View style={styles.gridRow}>
          {keys.map((key, i) => {
            const cat = words[key];
            const selected = state.selectedCats.includes(key);
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <GlowCard
                key={key}
                accent={selected ? accent : 'rgba(255,255,255,0.15)'}
                selected={selected}
                onPress={() => (cat.paid ? setLockedCat(cat.name) : toggleCat(key))}
                style={[styles.halfCard, cat.paid && styles.cardLocked]}
              >
                {selected && <Text style={[styles.check, styles.checkTopRight, { color: accent }]}>{'✓'}</Text>}
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catName, cat.paid && styles.catNameLocked]}>{cat.name}</Text>
                <Text style={styles.catCount}>
                  {cat.words.length} words {'·'}{' '}
                  <Text style={{ color: difficultyColor(cat.difficulty), fontFamily: fonts.displaySemi }}>
                    {cat.difficulty}
                  </Text>
                </Text>
                {cat.paid && (
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedBadgeText}>{'🔒'} Premium</Text>
                  </View>
                )}
              </GlowCard>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton label="Next →" onPress={next} />
      </View>
      {message && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}

      <Modal visible={!!lockedCat} transparent animationType="slide" onRequestClose={() => setLockedCat(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setLockedCat(null)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetIcon}>{'🔒'}</Text>
            <Text style={styles.sheetTitle}>Premium Pack</Text>
            <Text style={styles.sheetSubtitle}>
              "{lockedCat}" is part of a Premium Pack. Unlock it to play with these words.
            </Text>
            <View style={styles.sheetTag}>
              <Text style={styles.sheetTagText}>{'✨'} COMING SOON</Text>
            </View>
            <OutlineButton label="Got It" onPress={() => setLockedCat(null)} style={{ width: '100%' }} />
          </Pressable>
        </Pressable>
      </Modal>
    </IllustratedScreen>
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, gap: 12 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  allCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  halfCard: { width: '47.5%', padding: 16, gap: 6 },
  cardLocked: { opacity: 0.6 },
  catIcon: { fontSize: 26 },
  catName: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#f5f2ea' },
  catNameLocked: { color: '#8b86ad' },
  catCount: { fontFamily: fonts.mono, fontSize: 11, color: '#8b86ad' },
  check: { fontFamily: fonts.displayBold },
  checkTopRight: { position: 'absolute', top: 10, right: 12 },
  lockedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,197,24,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.3)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 2,
  },
  lockedBadgeText: { fontFamily: fonts.mono, fontSize: 10, color: colors.accent, fontWeight: '700' },
  footer: { padding: 20, paddingBottom: 24 },

  toast: { position: 'absolute', bottom: 100, left: 24, right: 24, alignItems: 'center' },
  toastText: {
    backgroundColor: 'rgba(20,15,45,0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#f5f2ea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontFamily: fonts.mono,
    fontSize: 13,
    overflow: 'hidden',
  },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#151030',
    borderTopWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  sheetIcon: { fontSize: 48 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 22, color: '#f5f2ea' },
  sheetSubtitle: { fontFamily: fonts.body, fontSize: 14, color: '#c7c2e0', textAlign: 'center', maxWidth: 280 },
  sheetTag: {
    backgroundColor: 'rgba(245,197,24,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,24,0.35)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sheetTagText: { fontFamily: fonts.mono, fontSize: 12, color: colors.accent, fontWeight: '700' },
});
