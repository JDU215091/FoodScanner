// screens/WorkoutDetailScreen.js — flat lavender/blue UI (в едином стиле)
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  ArrowLeft,
  Clock,
  Flame,
  Calendar as CalIcon,
  Edit2,
  Trash2,
  Save,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const C = {
  bg: "#EEF2FF",
  card: "#FFFFFF",
  border: "#E4E7EC",
  text: "#0B1220",
  sub: "#667085",
  primary: "#5B7CFF",
  red: "#EF4444",
  green: "#22C55E",
};

const R = 22;
const chipList = ["Кардио", "Силовая", "Йога", "Плавание", "Велосипед", "Танцы"];

export default function WorkoutDetailScreen({ route, navigation }) {
  const { workoutId = null, date = null } = route.params || {};
  const createMode = !workoutId;

  const [workout, setWorkout] = useState(null);
  const [wType, setWType] = useState("Кардио");
  const [wName, setWName] = useState("");
  const [wDuration, setWDuration] = useState("");
  const [wCalories, setWCalories] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (createMode) {
      const dt = date ? new Date(date) : new Date();
      setWorkout({
        id: null,
        type: "Кардио",
        name: "",
        duration: 0,
        calories: 0,
        date: dt.toISOString(),
        time: dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        icon: "🏃‍♂️",
      });
      setWType("Кардио");
      setWName("");
      setWDuration("");
      setWCalories("");
    } else {
      loadWorkout();
    }
  }, [workoutId, date]);

  const loadWorkout = async () => {
    try {
      const savedWorkouts = await AsyncStorage.getItem("workouts");
      if (!savedWorkouts) {
        Alert.alert("Нет данных", "Тренировка не найдена");
        navigation.goBack();
        return;
      }
      const arr = JSON.parse(savedWorkouts);
      const found = arr.find((w) => w.id === workoutId);
      if (!found) {
        Alert.alert("Нет данных", "Тренировка не найдена");
        navigation.goBack();
        return;
      }
      setWorkout(found);
    } catch (e) {
      console.error("Error loading workout:", e);
      navigation.goBack();
    }
  };

  const getWorkoutImage = () => {
    // плейсхолдер — подставь своё изображение при желании
    return require("../assets/adaptive-icon.png");
  };

  const saveNew = async () => {
    const duration = parseInt(wDuration, 10);
    const calories = parseInt(wCalories, 10);
    if (!duration || duration <= 0 || !calories || calories <= 0) {
      Alert.alert("Проверь данные", "Заполни длительность и калории (положительные числа).");
      return;
    }
    setSaving(true);
    try {
      const now = date ? new Date(date) : new Date();
      const id = Date.now();
      const newWorkout = {
        id,
        type: wType,
        name: wName?.trim() || wType,
        duration,
        calories,
        date: now.toISOString(),
        time: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        icon: "🏃‍♂️",
      };

      const saved = await AsyncStorage.getItem("workouts");
      const list = saved ? JSON.parse(saved) : [];
      const updated = [...list, newWorkout];
      await AsyncStorage.setItem("workouts", JSON.stringify(updated));

      const totalBurned = updated.reduce((s, w) => s + (w.calories || 0), 0);
      await AsyncStorage.setItem("caloriesBurned", totalBurned.toString());

      navigation.goBack();
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось сохранить тренировку");
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkout = async () => {
    try {
      const saved = await AsyncStorage.getItem("workouts");
      if (!saved) return navigation.goBack();
      const arr = JSON.parse(saved);
      const updated = arr.filter((w) => w.id !== workoutId);
      await AsyncStorage.setItem("workouts", JSON.stringify(updated));
      const totalBurned = updated.reduce((s, w) => s + (w.calories || 0), 0);
      await AsyncStorage.setItem("caloriesBurned", totalBurned.toString());
      navigation.goBack();
    } catch (e) {
      console.error("Error deleting workout:", e);
    }
  };

  if (!createMode && !workout) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <Text>Загрузка…</Text>
      </SafeAreaView>
    );
  }

  const shown = createMode
    ? { type: wType, duration: wDuration || 0, calories: wCalories || 0, date: workout?.date }
    : workout;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={C.text} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {createMode ? "Новая тренировка" : "Детали тренировки"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Cover */}
            {/* <View style={styles.coverCard}>
              <Image source={getWorkoutImage(shown.type)} style={styles.coverImage} />
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeIcon}>{createMode ? "✨" : workout?.icon || "🏃‍♂️"}</Text>
                <Text style={styles.coverBadgeText}>{shown.type}</Text>
              </View>
            </View> */}

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Clock size={24} color={C.primary} />
                <Text style={styles.statValue}>{Number(shown.duration) || 0}</Text>
                <Text style={styles.statLabel}>минут</Text>
              </View>
              <View style={styles.statCard}>
                <Flame size={24} color={C.red} />
                <Text style={styles.statValue}>{Number(shown.calories) || 0}</Text>
                <Text style={styles.statLabel}>калорий</Text>
              </View>
              <View style={styles.statCard}>
                <CalIcon size={24} color={C.green} />
                <Text style={styles.statValue}>
                  {new Date(shown.date || new Date()).toLocaleDateString("ru-RU")}
                </Text>
                <Text style={styles.statLabel}>дата</Text>
              </View>
            </View>

            {/* Details / Form */}
            <View style={styles.blockCard}>
              <Text style={styles.blockTitle}>
                {createMode ? "Заполните данные" : "Информация"}
              </Text>

              {createMode ? (
                <>
                  {/* Chips */}
                  <View style={styles.chipsWrap}>
                    {chipList.map((t) => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setWType(t)}
                        style={[styles.chip, wType === t && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, wType === t && styles.chipTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.inputLabel}>Название (необязательно)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Например, Утренняя беговая"
                      placeholderTextColor={C.sub}
                      value={wName}
                      onChangeText={setWName}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Длительность, мин *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="30"
                        placeholderTextColor={C.sub}
                        keyboardType="numeric"
                        value={wDuration}
                        onChangeText={setWDuration}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Калории, ккал *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="250"
                        placeholderTextColor={C.sub}
                        keyboardType="numeric"
                        value={wCalories}
                        onChangeText={setWCalories}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <DetailRow label="Тип тренировки:" value={workout.type} />
                  <DetailRow label="Время:" value={workout.time} />
                  <DetailRow
                    label="Интенсивность:"
                    value={
                      workout.calories / workout.duration > 7
                        ? "Высокая"
                        : workout.calories / workout.duration > 4
                        ? "Средняя"
                        : "Низкая"
                    }
                  />
                  <DetailRow
                    label="Калорий в минуту:"
                    value={(workout.calories / workout.duration).toFixed(1)}
                  />
                </>
              )}
            </View>

            {/* Actions */}
            {createMode ? (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
                  onPress={saveNew}
                  disabled={saving}
                >
                  <Save size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    {saving ? "Сохраняю..." : "Сохранить"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.ghostBtn} onPress={() => Alert.alert("Скоро", "Редактирование скоро будет доступно")}>
                  <Edit2 size={18} color={C.primary} />
                  <Text style={styles.ghostBtnText}>Редактировать</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dangerBtn} onPress={deleteWorkout}>
                  <Trash2 size={18} color={C.red} />
                  <Text style={styles.dangerBtnText}>Удалить</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safeArea: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },
  container: { padding: 16, paddingBottom: 120 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.bg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: C.text },

  // Cover
  coverCard: {
    backgroundColor: C.card,
    borderRadius: R,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  coverImage: { width: "100%", height: 180, resizeMode: "cover" },
  coverBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b122014", // полупрозрачная
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#00000014",
  },
  coverBadgeIcon: { fontSize: 16, marginRight: 6, color: "#fff" },
  coverBadgeText: { color: "#fff", fontWeight: "800" },

  // Stats
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    paddingVertical: 14,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: C.text, marginTop: 6 },
  statLabel: { fontSize: 12, color: C.sub, marginTop: 2 },

  // Block card
  blockCard: {
    backgroundColor: C.card,
    borderRadius: R,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 16,
  },
  blockTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 12 },

  // Detail rows
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  detailLabel: { fontSize: 14, color: C.sub },
  detailValue: { fontSize: 14, fontWeight: "700", color: C.text },

  // Chips + Inputs
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F7F8FF",
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  chipText: { color: C.sub, fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  row: { flexDirection: "row", gap: 10 },

  inputLabel: { color: C.sub, marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: "#F7F8FF",
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
    fontSize: 15,
    color: C.text,
  },

  // Actions
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 16 },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  ghostBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#FAFAFF",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ghostBtnText: { color: C.primary, fontWeight: "800" },

  dangerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  dangerBtnText: { color: C.red, fontWeight: "800" },
});
