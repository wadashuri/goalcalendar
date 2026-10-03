import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../../features/habit/HabitProvider";
import {
  HABIT_ICONS,
  MAX_HABIT_NAME_LENGTH,
  validateHabitName,
  type Habit,
  type HabitIcon,
} from "../../features/habit/model";
import { HabitIconBadge } from "../../components/HabitIconBadge";
import { colors } from "../../components/ui";

export default function SettingsScreen() {
  const { habits, updateHabit, ready, error: loadError, reload } = useHabits();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<HabitIcon>(HABIT_ICONS[0]);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pending = useRef(false);
  const [busy, setBusy] = useState(false);

  const validName = validateHabitName(name);

  function openEditForm(habit: Habit) {
    setEditingId(habit.id);
    setName(habit.name);
    setIcon(habit.icon);
    setError(null);
    setFormOpen(true);
  }

  function closeForm() {
    if (pending.current) return;
    setFormOpen(false);
    setEditingId(null);
  }

  async function handleSave() {
    if (!ready || !editingId || pending.current) return;
    if (!validName) {
      setError("1〜20文字で入力してください。");
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      await updateHabit(editingId, validName, icon);
      setFormOpen(false);
      setEditingId(null);
    } catch {
      setError("保存できませんでした。もう一度お試しください。");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  if (!ready)
    return (
      <View style={styles.container}>
        <Text>{loadError ?? "読み込み中…"}</Text>
        {loadError && (
          <Pressable onPress={() => void reload()}>
            <Text>再読み込み</Text>
          </Pressable>
        )}
      </View>
    );

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>設定</Text>
      <Text style={styles.text}>
        8個の目標の名前・スタンプを変更できます。色は固定です。
      </Text>

      {habits.length === 0 ? (
        <Text style={styles.empty}>まだ目標が登録されていません。</Text>
      ) : (
        <View style={styles.list}>
          {habits.map((habit) => (
            <View key={habit.id} style={styles.row}>
              <HabitIconBadge habit={habit} size={36} />
              <Text style={styles.rowName}>{habit.name}</Text>
              <Pressable
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={`${habit.name}を編集`}
                onPress={() => openEditForm(habit)}
                style={styles.rowButton}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={formOpen}
        transparent
        animationType="fade"
        onRequestClose={closeForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>目標を変更</Text>
            <Text style={styles.formLabel}>名前</Text>
            <TextInput
              editable={!busy}
              value={name}
              onChangeText={setName}
              maxLength={MAX_HABIT_NAME_LENGTH}
              placeholder="目標の名前"
              style={styles.input}
            />

            <Text style={styles.formLabel}>スタンプ（100種類）</Text>
            <ScrollView
              nestedScrollEnabled
              style={styles.stampList}
              contentContainerStyle={styles.iconRow}
              keyboardShouldPersistTaps="handled"
            >
              {HABIT_ICONS.map((i) => (
                <Pressable
                  key={i}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={`スタンプ ${HABIT_ICONS.indexOf(i) + 1}`}
                  accessibilityState={{ selected: i === icon }}
                  onPress={() => setIcon(i)}
                  style={[
                    styles.iconOption,
                    i === icon && styles.iconOptionSelected,
                  ]}
                >
                  <Ionicons name={i} size={20} color={colors.ink} />
                </Pressable>
              ))}
            </ScrollView>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.formButtons}>
              <Pressable
                disabled={busy}
                accessibilityRole="button"
                onPress={closeForm}
                style={[styles.formButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!validName || busy}
                onPress={() => void handleSave()}
                style={[
                  styles.formButton,
                  styles.saveButton,
                  !validName && styles.saveButtonDisabled,
                ]}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, gap: 12, alignItems: "stretch" },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink },
  text: { fontSize: 14, color: colors.muted },
  empty: { fontSize: 14, color: colors.muted, marginTop: 12 },
  list: { gap: 10, marginTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  rowName: { flex: 1, fontSize: 15, color: colors.ink, fontWeight: "600" },
  rowButton: { padding: 6 },
  addButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
  },
  addButtonText: { color: colors.onAccent, fontWeight: "700", fontSize: 15 },
  limitText: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  form: {
    flexGrow: 0,
    maxHeight: "100%",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formContent: { padding: 20, gap: 12 },
  formLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.ink,
  },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  swatchSelected: { borderWidth: 3, borderColor: colors.ink },
  stampList: { maxHeight: 240 },
  iconRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconOptionSelected: { borderColor: colors.accentText, borderWidth: 2 },
  errorText: { color: colors.accentText, fontSize: 13 },
  formButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
  formButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: { color: colors.muted, fontWeight: "600" },
  saveButton: { backgroundColor: colors.accent },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: colors.onAccent, fontWeight: "700" },
});
