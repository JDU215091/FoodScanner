// screens/HomeScreen.js — visual refresh + секция «Тренировки» с добавлением своих упражнений
// Дизайн: мягкий лавандовый фон, белые карточки (R=22), pill-кнопки.
// ЛОГИКА еды/воды сохранена. Добавлено: модалка «Добавить тренировку» (пресеты + ручной ввод).
import { Alert } from "react-native";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Modal,
  ScrollView,
  Animated,
  TextInput,
} from "react-native";
import {
  Scan,
  Settings,
  Activity as ActivityIcon,
  Plus,
  Target,
  Flame,
  Zap,
  Trash2,
  User,
  BarChart3,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../auth/AuthProvider";
import { useNavigation } from "@react-navigation/native";
import {
  updateStreak,
  addWaterAndCheckAchievements,
  addCaloriesAndCheckAchievements,
  addWorkoutAndCheckAchievements,
} from "../utils/achievementsUtils";
import { sendAchievementNotification } from "../utils/notificationsUtils";
import { achievementToastState } from "../App";

const { width } = Dimensions.get("window");

// Цвета под референс
const C = {
  bg: "#EEF2FF",
  card: "#FFFFFF",
  border: "#E4E7EC",
  text: "#0B1220",
  sub: "#667085",
  primary: "#5B7CFF",
  accent: "#3F8CFF",
  red: "#EF4444",
  blueSoft: "#ECF3FF",
  green: "#22C55E",
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { signOut: doSignOut } = useAuth();

  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Питание
  const [caloriesEaten, setCaloriesEaten] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [caloriesBurned, setCaloriesBurned] = useState(0);

  // Вода
  const [waterUnit, setWaterUnit] = useState("liters");
  const [waterGlasses, setWaterGlasses] = useState({});
  const [caloriesLeft, setCaloriesLeft] = useState(0);

  // Тренировки
  const [workouts, setWorkouts] = useState([]);

  // Модалка добавления тренировки
  const [addWModal, setAddWModal] = useState(false);
  const [wType, setWType] = useState("Кардио"); // тип
  const [wName, setWName] = useState(""); // название/заметка
  const [wDuration, setWDuration] = useState(""); // минуты (string для TextInput)
  const [wCalories, setWCalories] = useState(""); // ккал (string для TextInput)
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const calculated = calorieGoal - caloriesEaten + caloriesBurned;
    setCaloriesLeft(calculated);
  }, [calorieGoal, caloriesEaten, caloriesBurned]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem("userProfile");
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          setCalorieGoal(profile.calorieGoal || 2000);
        }
        const savedCalories = await AsyncStorage.getItem("caloriesEaten");
        if (savedCalories) setCaloriesEaten(parseInt(savedCalories, 10) || 0);

        const savedWorkouts = await AsyncStorage.getItem("workouts");
        if (savedWorkouts) {
          const items = JSON.parse(savedWorkouts) || [];
          setWorkouts(items);
          const totalBurned = items.reduce((sum, w) => sum + (w.calories || 0), 0);
          setCaloriesBurned(totalBurned);
        }

        // Обновить streak при открытии приложения
        await updateStreak();
      } catch (e) {
        console.error("Error loading user data:", e);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("caloriesEaten", caloriesEaten.toString()).catch(() => {});
  }, [caloriesEaten]);

  // Дата/неделя
  const [selectedDate, setSelectedDate] = useState(new Date());
  const getWeekDates = () => {
    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d);
    }
    return dates;
  };
  const weekDates = getWeekDates();
  const selectedDayIndex = weekDates.findIndex(
    (d) => d.toDateString() === selectedDate.toDateString()
  );
  const handlePreviousDay = () =>
    setSelectedDate((prev) => new Date(prev.getTime() - 86400000));
  const handleNextDay = () =>
    setSelectedDate((prev) => new Date(prev.getTime() + 86400000));
  const formatDate = (date) =>
    date.toLocaleDateString("ru-RU", { weekday: "short", month: "short", day: "numeric" });
  const getDateKey = (date) => date.toISOString().split("T")[0];

  // Вода
  const getTotalWater = () => {
    const glasses = waterGlasses[getDateKey(selectedDate)] || [];
    return glasses.reduce((total, g) => total + g.amount, 0);
  };

  const addWaterGlass = async (amount) => {
    const dateKey = getDateKey(selectedDate);
    const glasses = waterGlasses[dateKey] || [];
    const heightAnim = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    Animated.timing(heightAnim, { toValue: amount * 64, duration: 600, useNativeDriver: false }).start();
    const newGlass = { id: Date.now(), amount, heightAnim, opacity };
    setWaterGlasses({ ...waterGlasses, [dateKey]: [...glasses, newGlass] });

    // Проверка достижений за воду
    try {
      const newAchievements = await addWaterAndCheckAchievements(amount);
      // Показать всплывающие уведомления о новых достижениях
      for (const achievement of newAchievements) {
        achievementToastState.show(achievement);
        await sendAchievementNotification(achievement);
      }
    } catch (e) {
      console.error("Error checking water achievements:", e);
    }
  };

  const removeWaterGlass = (id) => {
    const dateKey = getDateKey(selectedDate);
    const glasses = waterGlasses[dateKey] || [];
    const glass = glasses.find((g) => g.id === id);
    if (!glass) return;
    Animated.timing(glass.opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
      setWaterGlasses((prev) => ({ ...prev, [dateKey]: prev[dateKey].filter((g) => g.id !== id) }))
    );
  };

  const resetAllWater = () => {
    const dateKey = getDateKey(selectedDate);
    const glasses = waterGlasses[dateKey] || [];
    glasses.forEach((glass) => {
      if (glass.opacity)
        Animated.timing(glass.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
    });
    setTimeout(
      () => setWaterGlasses((prev) => ({ ...prev, [dateKey]: [] })),
      300
    );
  };

  const saveSettings = async () => {
    await AsyncStorage.setItem("waterUnit", waterUnit);
  };

  const renderWaterGlass = (glass) => (
    <Animated.View key={glass.id} style={[styles.waterGlassContainer, { opacity: glass.opacity }]}>
      <View style={styles.waterGlassOutline}>
        <Animated.View style={[styles.waterFill, { height: glass.heightAnim }]} />
      </View>
      <Text style={styles.waterGlassText}>
        {waterUnit === "liters" ? `${glass.amount} л` : `${Math.round(glass.amount * 1000)} мл`}
      </Text>
      <TouchableOpacity style={styles.deleteGlassButton} onPress={() => removeWaterGlass(glass.id)}>
        <Trash2 size={16} color={C.red} />
      </TouchableOpacity>
    </Animated.View>
  );

  // Пример данных еды на сегодня (как было)
  const todayFoods = [
    { id: 1, name: "Яблоко", calories: 95 },
    { id: 2, name: "Банан", calories: 105 },
    { id: 3, name: "Курица", calories: 239 },
  ];

  const handleProfile = () => navigation.navigate("Profile");

  // Форматтер
  const formatDuration = (mins) => {
    if (!mins && mins !== 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}м`;
  };

  // ===== Добавление тренировки =====
  const presetTypes = ["Кардио", "Силовая", "Йога", "Плавание", "Велосипед", "Танцы"];

  const openAddWorkout = () => {
    setWType("Кардио");
    setWName("");
    setWDuration("");
    setWCalories("");
    setAddWModal(true);
  };

  const addWorkout = async () => {
    // Валидация
    const duration = parseInt(wDuration, 10);
    const calories = parseInt(wCalories, 10);
    if (!duration || duration <= 0 || !calories || calories <= 0) {
      Alert.alert("Проверь данные", "Заполни длительность и калории (положительные числа).");
      return;
    }
    setSaving(true);
    try {
      const now = new Date();
      const id = Date.now();
      const newWorkout = {
        id,
        type: wType,
        name: wName?.trim() || wType,
        duration,            // минуты
        calories,            // ккал
        date: now.toISOString(),
        time: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        icon: "🏃‍♂️",        // просто эмодзи-плейсхолдер
      };

      const saved = await AsyncStorage.getItem("workouts");
      const list = saved ? JSON.parse(saved) : [];
      const updated = [...list, newWorkout];
      await AsyncStorage.setItem("workouts", JSON.stringify(updated));

      const totalBurned = updated.reduce((sum, w) => sum + (w.calories || 0), 0);
      await AsyncStorage.setItem("caloriesBurned", totalBurned.toString());

      setWorkouts(updated);
      setCaloriesBurned(totalBurned);
      setAddWModal(false);

      // Проверка достижений за калории и тренировки
      try {
        const caloriesAchievements = await addCaloriesAndCheckAchievements(calories);
        const workoutsAchievements = await addWorkoutAndCheckAchievements();
        const allNewAchievements = [...caloriesAchievements, ...workoutsAchievements];
        
        // Показать всплывающие уведомления о новых достижениях
        for (const achievement of allNewAchievements) {
          achievementToastState.show(achievement);
          await sendAchievementNotification(achievement);
        }
      } catch (e) {
        console.error("Error checking achievements:", e);
      }
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось сохранить тренировку");
    } finally {
      setSaving(false);
    }
  };

  const removeWorkout = async (id) => {
    try {
      const updated = workouts.filter((w) => w.id !== id);
      await AsyncStorage.setItem("workouts", JSON.stringify(updated));
      const totalBurned = updated.reduce((sum, w) => sum + (w.calories || 0), 0);
      await AsyncStorage.setItem("caloriesBurned", totalBurned.toString());
      setWorkouts(updated);
      setCaloriesBurned(totalBurned);
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setIsSettingsModalVisible(true)}>
              <Settings size={20} color={C.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Food Scanner</Text>
            <TouchableOpacity style={styles.iconButton} onPress={handleProfile}>
              <User size={20} color={C.text} />
            </TouchableOpacity>
          </View>

          {/* Calorie overview */}
          <View style={styles.overviewRow}>
            <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate("FoodLog")}>
              <Flame size={20} color={C.red} />
              <Text style={styles.statValue}>{caloriesEaten}</Text>
              <Text style={styles.statLabel}>Съедено</Text>
            </TouchableOpacity>

            <View style={styles.goalCircle}>
              <Target size={24} color={C.primary} />
              <Text style={styles.goalValue}>{caloriesLeft}</Text>
              <Text style={styles.goalLabel}>Осталось</Text>
              <Text style={styles.goalLabel}>ккал</Text>
            </View>

            <View style={styles.statCard}>
              <Zap size={20} color={C.green} />
              <Text style={styles.statValue}>{caloriesBurned}</Text>
              <Text style={styles.statLabel}>Сожжено</Text>
            </View>
          </View>

          {/* Быстрые действия */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.pillBtn, { backgroundColor: C.primary }]}
              onPress={() => navigation.navigate("Scanner")}
            >
              <Scan size={18} color="#fff" />
              <Text style={styles.pillTextLight}>Сканировать</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pillBtn, { backgroundColor: C.accent }]}
              onPress={() => navigation.navigate("AddFood")}
            >
              <Plus size={18} color="#fff" />
              <Text style={styles.pillTextLight}>Добавить еду</Text>
            </TouchableOpacity>
          </View>

          {/* Дата/неделя */}
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.arrowBtn} onPress={handlePreviousDay}>
              <Text style={styles.arrowText}>←</Text>
            </TouchableOpacity>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>
                {selectedDate.toDateString() === new Date().toDateString()
                  ? "Сегодня"
                  : formatDate(selectedDate)}
              </Text>
            </View>
            <TouchableOpacity style={styles.arrowBtn} onPress={handleNextDay}>
              <Text style={styles.arrowText}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dayPicker}>
            {weekDates.map((d, idx) => {
              const selected = idx === selectedDayIndex;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dayChip, selected && styles.dayChipActive]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={[styles.dayChipWeek, selected && styles.dayChipActiveText]}>
                    {d.toLocaleDateString("ru-RU", { weekday: "short" }).replace(/\./g, "")}
                  </Text>
                  <Text style={[styles.dayChipDate, selected && styles.dayChipActiveText]}>
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Вода */}
          <View style={styles.cardBlock}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>Вода</Text>
              <Text style={styles.blockKPI}>
                {waterUnit === "liters"
                  ? `${getTotalWater().toFixed(1)} л`
                  : `${Math.round(getTotalWater() * 1000)} мл`}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 120 }}>
              <View style={styles.waterRow}>
                {(waterGlasses[getDateKey(selectedDate)] || []).map(renderWaterGlass)}
                <TouchableOpacity style={styles.addWaterBtn} onPress={() => setIsModalVisible(true)}>
                  <Plus size={18} color={C.primary} />
                  <Text style={styles.addWaterTxt}>Добавить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Недавняя еда */}
          <View style={styles.cardBlock}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>Недавняя еда</Text>
              <TouchableOpacity onPress={() => navigation.navigate("FoodLog")}>
                <Text style={styles.linkText}>Смотреть все</Text>
              </TouchableOpacity>
            </View>
            {todayFoods.length > 0 ? (
              todayFoods.slice(0, 3).map((food) => (
                <View key={food.id} style={styles.foodRow}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodCals}>{food.calories} ккал</Text>
                </View>
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Нет данных</Text>
              </View>
            )}
          </View>

          {/* Тренировки */}
          <View style={styles.cardBlock}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockTitle}>Тренировки</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity onPress={() => navigation.navigate("Stats")}>
                  <Text style={styles.linkText}>Статистика</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openAddWorkout}>
                  <Text style={styles.linkText}>Добавить</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.workoutSummaryRow}>
              <View style={styles.workoutSummaryCard}>
                <Zap size={18} color={C.green} />
                <Text style={styles.workoutSummaryValue}>{caloriesBurned}</Text>
                <Text style={styles.workoutSummaryLabel}>Ккал сожжено</Text>
              </View>
              <View style={styles.workoutSummaryCard}>
                <BarChart3 size={18} color={C.primary} />
                <Text style={styles.workoutSummaryValue}>{workouts.length}</Text>
                <Text style={styles.workoutSummaryLabel}>Тренировок</Text>
              </View>
            </View>

            {/* Recent workouts */}
            {workouts && workouts.length > 0 ? (
              workouts
                .slice(-3)
                .reverse()
                .map((w) => (
                  <View key={w.id} style={styles.workoutRow}>
                    <View style={styles.workoutLeft}>
                      <View style={styles.workoutIconBox}>
                        <ActivityIcon size={18} color={C.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.workoutName}>{w.name || w.type || "Тренировка"}</Text>
                        <Text style={styles.workoutMeta}>
                          {formatDuration(w.duration || 0)}
                          {w.date ? ` • ${new Date(w.date).toLocaleDateString("ru-RU")}` : ""}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.workoutCals}>+{w.calories || 0} ккал</Text>
                      <TouchableOpacity
                        style={styles.smallGhost}
                        onPress={() => removeWorkout(w.id)}
                      >
                        <Trash2 size={14} color={C.sub} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
            ) : (
              <View style={styles.noActivity}>
                <View style={styles.activityIconBox}>
                  <ActivityIcon size={24} color={C.primary} />
                </View>
                <Text style={styles.noActivityTitle}>Нет тренировок</Text>
                <Text style={styles.noActivitySub}>Добавьте тренировку и отслеживайте прогресс</Text>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={openAddWorkout}
                >
                  <Plus size={16} color={C.sub} />
                  <Text style={styles.ghostBtnText}>Добавить тренировку</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Модалка: Добавить воду */}
        <Modal
          animationType="fade"
          transparent
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Добавить воду</Text>
              <View style={styles.modalBody}>
                {[0.2, 0.5, 1.0].map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={styles.modalBtn}
                    onPress={() => {
                      addWaterGlass(v);
                      setIsModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalBtnText}>{v.toFixed(1)} л</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.modalBtn, styles.modalBtnReset]} onPress={resetAllWater}>
                  <Text style={styles.modalBtnText}>Сбросить</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.modalClose} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalCloseText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Модалка: Добавить тренировку */}
        <Modal
          animationType="fade"
          transparent
          visible={addWModal}
          onRequestClose={() => setAddWModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Добавить тренировку</Text>

              <View style={{ padding: 16, gap: 10 }}>
                {/* Presets */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {presetTypes.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setWType(t)}
                      style={[
                        styles.chip,
                        wType === t && styles.chipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          wType === t && styles.chipTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Inputs */}
                <View>
                  <Text style={styles.inputLabel}>Название (необязательно)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Например, Утренняя беговая"
                    placeholderTextColor={C.sub}
                    value={wName}
                    onChangeText={setWName}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
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

                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={addWorkout}
                  disabled={saving}
                >
                  <Text style={styles.saveBtnText}>{saving ? "Сохраняю..." : "Сохранить"}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.modalClose} onPress={() => setAddWModal(false)}>
                <Text style={styles.modalCloseText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Модалка настроек */}
        <Modal
          animationType="fade"
          transparent
          visible={isSettingsModalVisible}
          onRequestClose={() => setIsSettingsModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Настройки</Text>
              <View style={{ padding: 16 }}>
                <Text style={styles.settingLabel}>Единицы воды</Text>
                <View style={styles.toggle}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, waterUnit === "liters" && styles.toggleBtnActive]}
                    onPress={() => {
                      setWaterUnit("liters");
                      saveSettings();
                    }}
                  >
                    <Text style={[styles.toggleText, waterUnit === "liters" && styles.toggleTextActive]}>
                      Литры
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, waterUnit === "milliliters" && styles.toggleBtnActive]}
                    onPress={() => {
                      setWaterUnit("milliliters");
                      saveSettings();
                    }}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        waterUnit === "milliliters" && styles.toggleTextActive,
                      ]}
                    >
                      Миллилитры
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.modalClose} onPress={() => setIsSettingsModalVisible(false)}>
                <Text style={styles.modalCloseText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const R = 22;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  safeArea: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 16,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: C.text },

  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: R,
    paddingVertical: 16,
    paddingHorizontal: 18,
    minWidth: 96,
    borderWidth: 1,
    borderColor: C.border,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: C.text, marginTop: 6 },
  statLabel: { fontSize: 12, color: C.sub, marginTop: 2 },

  goalCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  goalValue: { fontSize: 22, fontWeight: "700", color: C.text, marginTop: 6 },
  goalLabel: { fontSize: 12, color: C.text },

  quickRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginBottom: 18 },
  pillBtn: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  pillTextLight: { color: "#fff", fontWeight: "700", fontSize: 14 },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  arrowBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  arrowText: { fontSize: 18, color: C.text },
  dateBadge: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  dateText: { fontSize: 16, fontWeight: "700", color: C.text },

  dayPicker: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: C.card,
    borderRadius: R,
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  dayChip: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 12 },
  dayChipActive: { backgroundColor: C.primary },
  dayChipWeek: { fontSize: 12, color: C.sub },
  dayChipDate: { fontSize: 14, fontWeight: "700", color: C.text },
  dayChipActiveText: { color: "#fff" },

  cardBlock: {
    backgroundColor: C.card,
    borderRadius: R,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  blockTitle: { fontSize: 16, fontWeight: "700", color: C.text },
  blockKPI: { fontSize: 18, fontWeight: "700", color: C.primary },

  waterRow: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 4 },
  waterGlassContainer: { alignItems: "center", marginHorizontal: 6 },
  waterGlassOutline: {
    width: 40,
    height: 64,
    borderWidth: 2,
    borderColor: C.accent,
    backgroundColor: C.blueSoft,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 6,
  },
  waterFill: { width: "100%", backgroundColor: C.accent, borderRadius: 10 },
  waterGlassText: { fontSize: 11, fontWeight: "700", color: C.text, marginTop: 2 },
  deleteGlassButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  addWaterBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F8FF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#D9E2FF",
    minWidth: 64,
  },
  addWaterTxt: { fontSize: 12, fontWeight: "700", color: C.primary, marginTop: 4 },

  linkText: { fontSize: 14, color: C.primary, fontWeight: "700" },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },
  foodName: { fontSize: 16, color: C.text },
  foodCals: { fontSize: 14, color: C.sub },
  empty: { alignItems: "center", paddingVertical: 20 },
  emptyText: { fontSize: 16, color: C.sub },

  // Тренировки
  workoutSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  workoutSummaryCard: {
    flex: 1,
    backgroundColor: "#FAFAFF",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  workoutSummaryValue: { fontSize: 18, fontWeight: "800", color: C.text, marginTop: 6 },
  workoutSummaryLabel: { fontSize: 12, color: C.sub },

  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },
  workoutLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  workoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F4F6FF",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  workoutName: { fontSize: 15, fontWeight: "700", color: C.text },
  workoutMeta: { fontSize: 12, color: C.sub, marginTop: 2 },
  workoutCals: { fontSize: 14, fontWeight: "800", color: C.primary },
  smallGhost: {
    marginTop: 6,
    backgroundColor: "#F7F7FB",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  noActivity: { alignItems: "center", paddingVertical: 20 },
  activityIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F4F6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  noActivityTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 4 },
  noActivitySub: { fontSize: 14, color: C.sub, textAlign: "center", paddingHorizontal: 12 },
  ghostBtn: {
    backgroundColor: "#F7F7FB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ghostBtnText: { fontSize: 14, fontWeight: "700", color: C.sub },

  // Общие модалки
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: C.card,
    borderRadius: R,
    width: Math.min(width - 32, 360),
    borderWidth: 1,
    borderColor: C.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalBody: { padding: 16 },
  modalBtn: {
    backgroundColor: "#F6F8FF",
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9E2FF",
  },
  modalBtnReset: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  modalBtnText: { fontSize: 15, fontWeight: "700", color: C.text },
  modalClose: { padding: 16, alignItems: "center", borderTopWidth: 1, borderTopColor: C.border },
  modalCloseText: { fontSize: 15, color: C.sub, fontWeight: "700" },

  // Поля формы Add Workout
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F7F8FF",
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { color: C.sub, fontWeight: "700" },
  chipTextActive: { color: "#fff" },

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
  saveBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  saveBtnText: { color: "#fff", fontWeight: "800" },
});
