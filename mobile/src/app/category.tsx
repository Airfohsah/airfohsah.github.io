import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenHeader, Screen, Toast, useToast } from '../components/ui';
import { colors, difficultyColor, fonts, radius, spacing } from '../constants/theme';
import { useGameStore } from '../store/GameStore';

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
    <Screen>
      <ScreenHeader title="Pick Categories" onBack={goBack} />
      <View style={styles.grid}>
        <Pressable
          style={[styles.card, styles.allCard, allFreeSelected && styles.cardSelected]}
          onPress={toggleAllCats}
        >
          <Text style={styles.catIcon}>{'🌍'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.catName}>All Categories</Text>
            <Text style={styles.catCount}>Mix everything free</Text>
          </View>
          {allFreeSelected && <Text style={styles.check}>{'✓'}</Text>}
        </Pressable>

        <View style={styles.gridRow}>
          {keys.map((key) => {
            const cat = words[key];
            const selected = state.selectedCats.includes(key);
            return (
              <Pressable
                key={key}
                style={[
                  styles.card,
                  styles.halfCard,
                  selected && styles.cardSelected,
                  cat.paid && styles.cardLocked,
                ]}
                onPress={() => (cat.paid ? setLockedCat(cat.name) : toggleCat(key))}
              >
                {selected && <Text style={[styles.check, styles.checkTopRight]}>{'✓'}</Text>}
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
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Next →" onPress={next} />
      </View>
      <Toast message={message} />

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
            <Button label="Got It" variant="secondary" onPress={() => setLockedCat(null)} style={{ width: '100%' }} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flex: 1, paddingHorizontal: 20, gap: 12 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    padding: 16,
    gap: 6,
  },
  allCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  halfCard: { width: '47.5%' },
  cardSelected: { borderColor: colors.accent, backgroundColor: '#1a1800' },
  cardLocked: { opacity: 0.6 },
  catIcon: { fontSize: 26 },
  catName: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  catNameLocked: { color: colors.muted },
  catCount: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
  check: { color: colors.accent, fontFamily: fonts.displayBold },
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

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card2,
    borderTopWidth: 1.5,
    borderColor: colors.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  sheetIcon: { fontSize: 48 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
  sheetSubtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center', maxWidth: 280 },
  sheetTag: {
    backgroundColor: 'rgba(245,197,24,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,24,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sheetTagText: { fontFamily: fonts.mono, fontSize: 12, color: colors.accent, fontWeight: '700' },
});
