import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useToast } from '../ui';
import { GradientButton, OutlineButton } from '../illustrated';
import { difficultyColor, fonts, darkColors as colors, radius } from '../../constants/theme';
import { useGameStore } from '../../store/GameStore';
import { Difficulty, WordCategory, WordsData } from '../../types';
import { getGithubConfig, getWordsSha, setCachedWords, setWordsSha, GithubConfig } from '../../lib/storage';
import { getGithubToken, setGithubToken as saveGithubTokenSecure, clearGithubToken } from '../../lib/secure';
import { GithubPushError, pushWordsToGithub, verifyGithubToken } from '../../lib/github';

function slugify(name: string, existing: WordsData): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'category';
  let key = base;
  let n = 2;
  while (existing[key]) key = `${base}_${n++}`;
  return key;
}

function MiniButton({
  label,
  onPress,
  tone = 'default',
  disabled,
}: {
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}) {
  const toneStyle =
    tone === 'danger' ? styles.miniBtnDanger : tone === 'success' ? styles.miniBtnSuccess : styles.miniBtnDefault;
  const toneTextStyle =
    tone === 'danger' ? styles.miniBtnTextDanger : tone === 'success' ? styles.miniBtnTextSuccess : styles.miniBtnTextDefault;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.miniBtn, toneStyle, disabled && { opacity: 0.5 }]}>
      <Text style={[styles.miniBtnText, toneTextStyle]}>{label}</Text>
    </Pressable>
  );
}

export function AdminDashboard() {
  const { state, setWords } = useGameStore();
  const { message, showToast } = useToast();

  const [draft, setDraft] = useState<WordsData>(state.words);
  const [dirty, setDirty] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>(Object.keys(state.words)[0] ?? '');
  const [search, setSearch] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [addText, setAddText] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎯');
  const [newCatDiff, setNewCatDiff] = useState<Difficulty>('MEDIUM');
  const [newCatPaid, setNewCatPaid] = useState(false);
  const [newCatEnabled, setNewCatEnabled] = useState(true);

  const [githubConfig, setGithubConfigState] = useState<GithubConfig | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [pushing, setPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>('Ready');

  useEffect(() => {
    setDraft(state.words);
    setCurrentKey(Object.keys(state.words)[0] ?? '');
  }, [state.words]);

  useEffect(() => {
    getGithubConfig().then(setGithubConfigState);
    getGithubToken().then(setTokenState);
  }, []);

  const cat = draft[currentKey] as WordCategory | undefined;
  const catKeys = Object.keys(draft);

  const markDirty = () => setDirty(true);

  const updateCat = (key: string, patch: Partial<WordCategory>) => {
    setDraft((d) => ({ ...d, [key]: { ...d[key], ...patch } }));
    markDirty();
  };

  const deleteCat = (key: string) => {
    Alert.alert('Delete category?', `Delete "${draft[key].name}" and all its words? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setDraft((d) => {
            const next = { ...d };
            delete next[key];
            return next;
          });
          markDirty();
          setCurrentKey((k) => (k === key ? Object.keys(draft).find((x) => x !== key) ?? '' : k));
        },
      },
    ]);
  };

  const createCategory = () => {
    if (!newCatName.trim()) {
      showToast('Enter a category name');
      return;
    }
    const key = slugify(newCatName, draft);
    setDraft((d) => ({
      ...d,
      [key]: {
        name: newCatName.trim(),
        icon: newCatIcon || '🎯',
        difficulty: newCatDiff,
        paid: newCatPaid,
        enabled: newCatEnabled,
        words: [],
      },
    }));
    markDirty();
    setCurrentKey(key);
    setShowNewCat(false);
    setNewCatName('');
    setNewCatIcon('🎯');
    setNewCatDiff('MEDIUM');
    setNewCatPaid(false);
    setNewCatEnabled(true);
  };

  const filteredWords = useMemo(() => {
    if (!cat) return [];
    const q = search.toLowerCase();
    return cat.words.map((w, i) => ({ word: w, index: i })).filter((w) => w.word.toLowerCase().includes(q));
  }, [cat, search]);

  const addWords = () => {
    if (!cat) return;
    const lines = addText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    const existing = new Set(cat.words.map((w) => w.toLowerCase()));
    let added = 0;
    let skipped = 0;
    const next = [...cat.words];
    for (const line of lines) {
      if (existing.has(line.toLowerCase())) {
        skipped++;
      } else {
        next.push(line);
        existing.add(line.toLowerCase());
        added++;
      }
    }
    updateCat(currentKey, { words: next });
    setAddText('');
    showToast(added > 0 ? `Added ${added}${skipped ? `, skipped ${skipped} duplicate(s)` : ''}` : `All ${skipped} already exist`);
  };

  const saveEdit = (idx: number) => {
    if (!cat || !editValue.trim()) return;
    const next = cat.words.slice();
    next[idx] = editValue.trim();
    updateCat(currentKey, { words: next });
    setEditingIdx(null);
  };

  const deleteWord = (idx: number) => {
    if (!cat) return;
    const next = cat.words.slice();
    next.splice(idx, 1);
    updateCat(currentKey, { words: next });
  };

  const bulkDelete = () => {
    if (!cat || selected.size === 0) return;
    Alert.alert('Delete selected words?', `Delete ${selected.size} word(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const next = cat.words.filter((_, i) => !selected.has(i));
          updateCat(currentKey, { words: next });
          setSelected(new Set());
          setSelectMode(false);
        },
      },
    ]);
  };

  const saveTokenAndVerify = async () => {
    if (!tokenInput.trim() || !githubConfig) return;
    setPushStatus('Verifying token...');
    const ok = await verifyGithubToken(githubConfig, tokenInput.trim());
    if (!ok) {
      setPushStatus('Token could not access the repo.');
      return;
    }
    await saveGithubTokenSecure(tokenInput.trim());
    setTokenState(tokenInput.trim());
    setTokenInput('');
    setPushStatus('Token saved.');
  };

  const removeToken = async () => {
    await clearGithubToken();
    setTokenState(null);
    setPushStatus('Token removed.');
  };

  const push = async () => {
    if (!token || !githubConfig) {
      setPushStatus('Add a GitHub token first.');
      return;
    }
    setPushing(true);
    setPushStatus('Pushing to GitHub...');
    try {
      const knownSha = await getWordsSha();
      const newSha = await pushWordsToGithub(draft, githubConfig, token, knownSha);
      await setWordsSha(newSha);
      await setCachedWords(draft);
      setWords(draft);
      setDirty(false);
      setPushStatus('Pushed ✓ — every install will see this on next refresh.');
    } catch (e) {
      const msg = e instanceof GithubPushError ? e.message : 'Push failed.';
      setPushStatus(msg);
    } finally {
      setPushing(false);
    }
  };

  if (!githubConfig) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {catKeys.map((key) => {
          const c = draft[key];
          const isOff = c.enabled === false;
          return (
            <Pressable
              key={key}
              onPress={() => {
                setCurrentKey(key);
                setSearch('');
                setSelected(new Set());
                setSelectMode(false);
              }}
              style={[styles.tab, key === currentKey && styles.tabActive, isOff && styles.tabOff]}
            >
              <Text style={[styles.tabText, key === currentKey && styles.tabTextActive]}>
                {c.icon} {c.name}
                {c.paid ? '  💰' : ''}
                {isOff ? '  🚫' : ''}
              </Text>
            </Pressable>
          );
        })}
        <Pressable style={styles.addTab} onPress={() => setShowNewCat(true)}>
          <Text style={styles.addTabText}>+ New</Text>
        </Pressable>
      </ScrollView>

      {cat && (
        <View style={styles.banner}>
          <View style={styles.bannerTop}>
            <Text style={styles.bannerIcon}>{cat.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerName}>{cat.name}</Text>
              <Text style={styles.bannerMeta}>
                {cat.words.length} words {'·'} <Text style={{ color: difficultyColor(cat.difficulty, colors) }}>{cat.difficulty}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.bannerControls}>
            <Pressable style={styles.smallToggle} onPress={() => updateCat(currentKey, { paid: !cat.paid })}>
              <Text style={styles.smallToggleText}>{cat.paid ? '💰 Paid' : '🆓 Free'}</Text>
            </Pressable>
            <Pressable style={styles.smallToggle} onPress={() => updateCat(currentKey, { enabled: cat.enabled === false })}>
              <Text style={styles.smallToggleText}>{cat.enabled === false ? '🚫 Off' : '✅ On'}</Text>
            </Pressable>
            <Pressable style={styles.deleteChip} onPress={() => deleteCat(currentKey)}>
              <Text style={styles.deleteChipText}>{'🗑'} Delete</Text>
            </Pressable>
          </View>
        </View>
      )}

      {cat && (
        <>
          <View style={styles.editorHeader}>
            <Text style={styles.editorMeta}>{cat.words.length} words {'·'} {filteredWords.length} shown</Text>
            <Pressable onPress={() => { setSelectMode((v) => !v); setSelected(new Set()); }}>
              <Text style={styles.selectToggle}>{selectMode ? 'Done' : '☑ Select'}</Text>
            </Pressable>
          </View>

          {selectMode && selected.size > 0 && (
            <View style={styles.bulkBar}>
              <Text style={styles.bulkBarText}>{selected.size} selected</Text>
              <MiniButton label="Delete" tone="danger" onPress={bulkDelete} />
            </View>
          )}

          <TextInput
            style={styles.search}
            placeholder="Search words..."
            placeholderTextColor="#8b86ad"
            value={search}
            onChangeText={setSearch}
          />

          <View style={styles.addSection}>
            <Text style={styles.addSectionTitle}>Add New Words</Text>
            <Text style={styles.addSectionHint}>One word per line. Duplicates are skipped.</Text>
            <TextInput
              style={styles.addTextarea}
              multiline
              placeholder={'Jollof rice\nOwambe\nDanfo driver...'}
              placeholderTextColor="#8b86ad"
              value={addText}
              onChangeText={setAddText}
            />
            <MiniButton label="+ Add Words" tone="success" onPress={addWords} />
          </View>

          <View style={styles.wordList}>
            {filteredWords.length === 0 && <Text style={styles.emptyState}>No words yet — add some above!</Text>}
            {filteredWords.map(({ word, index }) =>
              editingIdx === index ? (
                <View key={index} style={styles.wordItem}>
                  <TextInput style={styles.wordEditInput} value={editValue} onChangeText={setEditValue} autoFocus />
                  <Pressable onPress={() => saveEdit(index)} style={styles.iconBtnSave}>
                    <Text style={styles.iconBtnText}>{'✓'}</Text>
                  </Pressable>
                  <Pressable onPress={() => setEditingIdx(null)} style={styles.iconBtnCancel}>
                    <Text style={styles.iconBtnText}>{'✕'}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  key={index}
                  style={[styles.wordItem, selected.has(index) && styles.wordItemSelected]}
                  onPress={() => {
                    if (!selectMode) return;
                    setSelected((s) => {
                      const next = new Set(s);
                      next.has(index) ? next.delete(index) : next.add(index);
                      return next;
                    });
                  }}
                >
                  <Text style={styles.wordText}>{word}</Text>
                  {!selectMode && (
                    <View style={styles.wordActions}>
                      <Pressable
                        onPress={() => {
                          setEditingIdx(index);
                          setEditValue(word);
                        }}
                        style={styles.iconBtnEdit}
                      >
                        <Text style={styles.iconBtnText}>{'✏️'}</Text>
                      </Pressable>
                      <Pressable onPress={() => deleteWord(index)} style={styles.iconBtnDel}>
                        <Text style={styles.iconBtnText}>{'✕'}</Text>
                      </Pressable>
                    </View>
                  )}
                </Pressable>
              )
            )}
          </View>
        </>
      )}

      <View style={styles.githubSection}>
        <Text style={styles.addSectionTitle}>Publish to everyone</Text>
        <Text style={styles.addSectionHint}>
          {token
            ? `Connected to ${githubConfig.owner}/${githubConfig.repo}. Pushing updates ${githubConfig.path} — every install picks it up on next refresh.`
            : 'Add a GitHub token (write access to this repo only) to publish your edits.'}
        </Text>
        {!token ? (
          <View style={{ gap: 10 }}>
            <TextInput
              style={styles.search}
              placeholder="ghp_... or github_pat_..."
              placeholderTextColor="#8b86ad"
              value={tokenInput}
              onChangeText={setTokenInput}
              secureTextEntry
              autoCapitalize="none"
            />
            <MiniButton label="Save Token" onPress={saveTokenAndVerify} />
          </View>
        ) : (
          <MiniButton label="Remove Token" tone="danger" onPress={removeToken} />
        )}
        <Text style={styles.pushStatus}>{pushStatus}</Text>
        <GradientButton
          label={dirty ? '⬆ Push Changes' : 'Nothing to push'}
          onPress={push}
          disabled={!dirty || !token || pushing}
          small
        />
      </View>

      {message && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{message}</Text>
        </View>
      )}

      <Modal visible={showNewCat} transparent animationType="slide" onRequestClose={() => setShowNewCat(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Category</Text>
            <TextInput
              style={styles.search}
              placeholder="Category name"
              placeholderTextColor="#8b86ad"
              value={newCatName}
              onChangeText={setNewCatName}
              maxLength={30}
            />
            <TextInput
              style={styles.search}
              placeholder="Emoji icon"
              placeholderTextColor="#8b86ad"
              value={newCatIcon}
              onChangeText={setNewCatIcon}
              maxLength={4}
            />
            <View style={styles.diffRow}>
              {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                <Pressable key={d} onPress={() => setNewCatDiff(d)} style={[styles.diffChip, newCatDiff === d && styles.diffChipActive]}>
                  <Text style={[styles.diffChipText, { color: difficultyColor(d, colors) }]}>{d}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.diffRow}>
              <Pressable style={[styles.smallToggle, { flex: 1 }]} onPress={() => setNewCatPaid((v) => !v)}>
                <Text style={styles.smallToggleText}>{newCatPaid ? '💰 Paid' : '🆓 Free'}</Text>
              </Pressable>
              <Pressable style={[styles.smallToggle, { flex: 1 }]} onPress={() => setNewCatEnabled((v) => !v)}>
                <Text style={styles.smallToggleText}>{newCatEnabled ? '✅ On' : '🚫 Off'}</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <GradientButton label="Create" onPress={createCategory} small style={{ flex: 1 }} />
              <OutlineButton label="Cancel" accent="rgba(255,82,82,0.5)" onPress={() => setShowNewCat(false)} small style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, paddingTop: 20, gap: 14 },
  tabs: { gap: 8, paddingBottom: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(8,10,26,0.72)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabOff: { opacity: 0.5 },
  tabText: { fontFamily: fonts.displaySemi, fontSize: 13, color: '#f5f2ea' },
  tabTextActive: { color: colors.bg },
  addTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0a2a1e', borderWidth: 1.5, borderColor: '#0e3a28' },
  addTabText: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accent3 },

  banner: { backgroundColor: 'rgba(8,10,26,0.72)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: radius.xl, padding: 16, gap: 14 },
  bannerTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bannerIcon: { fontSize: 32 },
  bannerName: { fontFamily: fonts.displayBold, fontSize: 16, color: '#f5f2ea' },
  bannerMeta: { fontFamily: fonts.mono, fontSize: 12, color: '#8b86ad', marginTop: 2 },
  bannerControls: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  smallToggle: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12 },
  smallToggleText: { fontFamily: fonts.displaySemi, fontSize: 12, color: '#f5f2ea' },
  deleteChip: { backgroundColor: '#2a1015', borderWidth: 1.5, borderColor: '#3a1520', borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 12 },
  deleteChipText: { fontFamily: fonts.displaySemi, fontSize: 12, color: colors.accent2 },

  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editorMeta: { fontFamily: fonts.mono, fontSize: 12, color: '#8b86ad' },
  selectToggle: { fontFamily: fonts.displaySemi, fontSize: 13, color: colors.accent2 },

  bulkBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2a1015', borderWidth: 1.5, borderColor: '#3a1520', borderRadius: radius.lg, padding: 12 },
  bulkBarText: { fontFamily: fonts.mono, fontSize: 13, color: colors.accent2 },

  search: {
    backgroundColor: 'rgba(8,10,26,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#f5f2ea',
    padding: 12,
    borderRadius: radius.lg,
    fontFamily: fonts.mono,
    fontSize: 13,
  },

  addSection: { backgroundColor: 'rgba(8,10,26,0.72)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: radius.xl, padding: 16, gap: 10 },
  addSectionTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: '#f5f2ea' },
  addSectionHint: { fontFamily: fonts.mono, fontSize: 11, color: '#8b86ad', lineHeight: 16 },
  addTextarea: {
    minHeight: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#f5f2ea',
    padding: 12,
    borderRadius: radius.md,
    fontFamily: fonts.mono,
    fontSize: 13,
    textAlignVertical: 'top',
  },

  wordList: { backgroundColor: 'rgba(8,10,26,0.72)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: radius.xl, overflow: 'hidden' },
  emptyState: { padding: 24, textAlign: 'center', color: '#8b86ad', fontFamily: fonts.mono, fontSize: 13 },
  wordItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  wordItemSelected: { backgroundColor: '#2a1015' },
  wordText: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: '#f5f2ea' },
  wordEditInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1.5, borderColor: colors.accent, color: '#f5f2ea', padding: 8, borderRadius: 8, fontFamily: fonts.body, fontSize: 14 },
  wordActions: { flexDirection: 'row', gap: 6 },
  iconBtnEdit: { width: 30, height: 30, borderRadius: 7, backgroundColor: '#1a1800', alignItems: 'center', justifyContent: 'center' },
  iconBtnDel: { width: 30, height: 30, borderRadius: 7, backgroundColor: '#2a1015', alignItems: 'center', justifyContent: 'center' },
  iconBtnSave: { width: 30, height: 30, borderRadius: 7, backgroundColor: '#0a2a1e', alignItems: 'center', justifyContent: 'center' },
  iconBtnCancel: { width: 30, height: 30, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 13 },

  githubSection: { backgroundColor: 'rgba(8,10,26,0.72)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: radius.xl, padding: 16, gap: 10, marginBottom: 20 },
  pushStatus: { fontFamily: fonts.mono, fontSize: 12, color: colors.accent },

  toast: { padding: 12, alignItems: 'center' },
  toastText: {
    backgroundColor: 'rgba(20,15,45,0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    color: '#f5f2ea',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    fontFamily: fonts.mono,
    fontSize: 12,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#151030', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: radius.xxl, padding: 22, gap: 12 },
  modalTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: '#f5f2ea', marginBottom: 4 },
  diffRow: { flexDirection: 'row', gap: 8 },
  diffChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  diffChipActive: { borderColor: colors.accent },
  diffChipText: { fontFamily: fonts.displaySemi, fontSize: 12 },

  miniBtn: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, alignSelf: 'flex-start' },
  miniBtnDefault: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' },
  miniBtnDanger: { backgroundColor: '#2a1015', borderColor: '#3a1520' },
  miniBtnSuccess: { backgroundColor: '#0a2a1e', borderColor: '#0e3a28' },
  miniBtnText: { fontFamily: fonts.displaySemi, fontSize: 13 },
  miniBtnTextDefault: { color: '#f5f2ea' },
  miniBtnTextDanger: { color: colors.accent2 },
  miniBtnTextSuccess: { color: colors.accent3 },
});
