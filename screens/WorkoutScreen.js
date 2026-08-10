// screens/WorkoutScreen.js
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Activity, Plus, Clock, Flame, Target, Play, Pause, Square, TrendingUp } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const workoutCardWidth = Math.min((width - 48) / 2, 140);

// Обновлённые типы тренировок с новой палитрой
const workoutTypes = [
  { id: 1, name: "Кардио", icon: "🏃", caloriesPerMinute: 8, color: "#A0D8EF" },
  { id: 2, name: "Силовая", icon: "💪", caloriesPerMinute: 6, color: "#EF4444" },
  { id: 3, name: "Йога", icon: "🧘", caloriesPerMinute: 3, color: "#B7E580" },
  { id: 4, name: "Плавание", icon: "🏊", caloriesPerMinute: 10, color: "#A0D8EF" },
  { id: 5, name: "Велосипед", icon: "🚴", caloriesPerMinute: 7, color: "#B7E580" },
  { id: 6, name: "Танцы", icon: "💃", caloriesPerMinute: 5, color: "#EF4444" },
];

export default function WorkoutScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [duration, setDuration] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeWorkout, setActiveWorkout] = useState(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const loadWorkouts = async () => {
    try {
      const savedWorkouts = await AsyncStorage.getItem("workouts");
      if (savedWorkouts) {
        setWorkouts(JSON.parse(savedWorkouts));
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
    }
  };

  const saveWorkouts = async (newWorkouts) => {
    try {
      await AsyncStorage.setItem("workouts", JSON.stringify(newWorkouts));
    } catch (error) {
      console.error("Error saving workouts:", error);
    }
  };

  const startWorkout = (workout) => {
    setActiveWorkout(workout);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const pauseWorkout = () => {
    setIsTimerRunning(false);
  };

  const resumeWorkout = () => {
    setIsTimerRunning(true);
  };

  const stopWorkout = async () => {
    if (activeWorkout && timerSeconds > 0) {
      const minutes = Math.floor(timerSeconds / 60);
      const caloriesBurned = Math.round(minutes * activeWorkout.caloriesPerMinute);

      const newWorkout = {
        id: Date.now(),
        type: activeWorkout.name,
        icon: activeWorkout.icon,
        duration: minutes,
        calories: caloriesBurned,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updatedWorkouts = [newWorkout, ...workouts];
      setWorkouts(updatedWorkouts);
      await saveWorkouts(updatedWorkouts);

      try {
        const existingCalories = await AsyncStorage.getItem("caloriesBurned");
        const currentCalories = existingCalories ? parseInt(existingCalories, 10) : 0;
        const newCalories = currentCalories + caloriesBurned;
        await AsyncStorage.setItem("caloriesBurned", newCalories.toString());
      } catch (error) {
        console.error("Error updating calories burned:", error);
      }

      Alert.alert("Тренировка завершена!", `Вы сожгли ${caloriesBurned} калорий за ${minutes} минут`, [{ text: "OK" }]);
    }

    setActiveWorkout(null);
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const addManualWorkout = async () => {
    if (!selectedWorkout || !duration) {
      Alert.alert("Ошибка", "Выберите тип тренировки и укажите продолжительность");
      return;
    }

    const minutes = parseInt(duration, 10);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert("Ошибка", "Укажите корректную продолжительность");
      return;
    }

    const caloriesBurned = Math.round(minutes * selectedWorkout.caloriesPerMinute);

    const newWorkout = {
      id: Date.now(),
      type: selectedWorkout.name,
      icon: selectedWorkout.icon,
      duration: minutes,
      calories: caloriesBurned,
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedWorkouts = [newWorkout, ...workouts];
    setWorkouts(updatedWorkouts);
    await saveWorkouts(updatedWorkouts);

    try {
      const existingCalories = await AsyncStorage.getItem("caloriesBurned");
      const currentCalories = existingCalories ? parseInt(existingCalories, 10) : 0;
      const newCalories = currentCalories + caloriesBurned;
      await AsyncStorage.setItem("caloriesBurned", newCalories.toString());
    } catch (error) {
      console.error("Error updating calories burned:", error);
    }

    setIsModalVisible(false);
    setSelectedWorkout(null);
    setDuration("");
  };

  // ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ ОЧИСТКИ ТРЕНИРОВОК
  const clearRecentWorkouts = async () => {
    if (workouts.length === 0) {
      Alert.alert("Нет данных", "Список тренировок уже пуст.");
      return;
    }

    Alert.alert(
      "Очистить тренировки",
      "Вы уверены, что хотите удалить все записи о тренировках?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        {
          text: "Очистить",
          style: "destructive",
          onPress: async () => {
            try {
              // Очищаем состояние
              setWorkouts([]);
              
              // Сохраняем пустой массив в AsyncStorage
              await AsyncStorage.setItem("workouts", JSON.stringify([]));
              
              // Опционально: сбрасываем сожженные калории
              // await AsyncStorage.setItem("caloriesBurned", "0");
              
              Alert.alert("Успешно", "Все тренировки удалены.");
            } catch (error) {
              console.error("Error clearing workouts:", error);
              Alert.alert("Ошибка", "Не удалось очистить тренировки.");
            }
          }
        }
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTodayWorkouts = () => {
    const today = new Date().toDateString();
    return workouts.filter((workout) => new Date(workout.date).toDateString() === today);
  };

  const getTotalCaloriesToday = () => {
    return getTodayWorkouts().reduce((total, workout) => total + workout.calories, 0);
  };

  const getTotalDurationToday = () => {
    return getTodayWorkouts().reduce((total, workout) => total + workout.duration, 0);
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyWorkouts = workouts.filter((workout) => new Date(workout.date) >= oneWeekAgo);
    const totalCalories = weeklyWorkouts.reduce((sum, w) => sum + w.calories, 0);
    const totalDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);

    return { workouts: weeklyWorkouts.length, calories: totalCalories, duration: totalDuration };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#E9EEFF" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Тренировки</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <Plus size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Today's Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Сегодня</Text>
                <View style={styles.weeklyStatsBadge}>
                  <TrendingUp size={14} color="#64748B" />
                  <Text style={styles.weeklyStatsText}>За неделю: {weeklyStats.workouts} тренировок</Text>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Flame size={20} color="#EF4444" />
                  <Text style={styles.statValue}>{getTotalCaloriesToday()}</Text>
                  <Text style={styles.statLabel}>Калории</Text>
                </View>
                <View style={styles.statCard}>
                  <Clock size={20} color="#B7E580" />
                  <Text style={styles.statValue}>{getTotalDurationToday()}</Text>
                  <Text style={styles.statLabel}>Минут</Text>
                </View>
                <View style={styles.statCard}>
                  <Target size={20} color="#A0D8EF" />
                  <Text style={styles.statValue}>{getTodayWorkouts().length}</Text>
                  <Text style={styles.statLabel}>Тренировки</Text>
                </View>
              </View>
            </View>

            {/* Active Workout Timer */}
            {activeWorkout && (
              <View style={[styles.timerContainer, { borderColor: activeWorkout.color }]}>
                <Text style={styles.timerTitle}>
                  {activeWorkout.icon} {activeWorkout.name}
                </Text>
                <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
                <Text style={styles.timerCalories}>
                  ~{Math.round((timerSeconds / 60) * activeWorkout.caloriesPerMinute)} ккал
                </Text>
                <View style={styles.timerControls}>
                  {isTimerRunning ? (
                    <TouchableOpacity style={styles.timerButton} onPress={pauseWorkout}>
                      <Pause size={20} color="#1E293B" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.timerButton} onPress={resumeWorkout}>
                      <Play size={20} color="#1E293B" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.timerButton, styles.stopButton]} onPress={stopWorkout}>
                    <Square size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quick Start Workouts */}
            <View style={styles.quickStartContainer}>
              <Text style={styles.sectionTitle}>Быстрый старт</Text>
              <View style={styles.workoutTypesGrid}>
                {workoutTypes.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={[
                      styles.workoutTypeCard,
                      { borderLeftColor: workout.color },
                      !!activeWorkout && styles.workoutTypeCardDisabled,
                    ]}
                    onPress={() => startWorkout(workout)}
                    disabled={!!activeWorkout}
                  >
                    <Text style={styles.workoutIcon}>{workout.icon}</Text>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutCalories}>{workout.caloriesPerMinute} ккал/мин</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Workouts */}
            <View style={styles.recentContainer}>
              {/* ✅ Заголовок с кнопкой "Очистить" */}
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Недавние тренировки</Text>
                {workouts.length > 0 && (
                  <TouchableOpacity onPress={clearRecentWorkouts}>
                    <Text style={styles.clearButton}>Очистить</Text>
                  </TouchableOpacity>
                )}
              </View>

              {workouts.length > 0 ? (
                workouts.slice(0, 10).map((workout) => (
                  <View key={workout.id} style={styles.workoutItem}>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutItemIcon}>{workout.icon}</Text>
                      <View style={styles.workoutDetails}>
                        <Text style={styles.workoutItemName}>{workout.type}</Text>
                        <Text style={styles.workoutItemTime}>
                          {new Date(workout.date).toLocaleDateString("ru-RU")} в {workout.time}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.workoutStats}>
                      <Text style={styles.workoutDuration}>{workout.duration} мин</Text>
                      <Text style={styles.workoutCaloriesText}>{workout.calories} ккал</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noWorkoutsContainer}>
                  <Text style={styles.noWorkoutsText}>Нет записанных тренировок</Text>
                  <Text style={styles.noWorkoutsSubtext}>Начните тренировку или добавьте вручную</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Add Workout Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Добавить тренировку</Text>

              <Text style={styles.modalLabel}>Тип тренировки:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalWorkoutTypes}>
                {workoutTypes.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={[
                      styles.modalWorkoutType,
                      selectedWorkout?.id === workout.id && styles.selectedWorkoutType,
                      { borderColor: workout.color },
                    ]}
                    onPress={() => setSelectedWorkout(workout)}
                  >
                    <Text style={styles.modalWorkoutIcon}>{workout.icon}</Text>
                    <Text style={styles.modalWorkoutName}>{workout.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>Продолжительность (минуты):</Text>
              <TextInput
                style={styles.modalInput}
                value={duration}
                onChangeText={setDuration}
                placeholder="Например: 30"
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setIsModalVisible(false);
                    setSelectedWorkout(null);
                    setDuration("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.addWorkoutButton]} onPress={addManualWorkout}>
                  <Text style={styles.addWorkoutButtonText}>Добавить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9EEFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#E9EEFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#E9EEFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  statsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  weeklyStatsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  weeklyStatsText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  timerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#A0D8EF",
  },
  timerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 12,
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  timerCalories: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 16,
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  timerButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  stopButton: {
    backgroundColor: "#EF4444",
  },
  quickStartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  workoutTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  workoutTypeCard: {
    width: workoutCardWidth,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
  },
  workoutTypeCardDisabled: {
    opacity: 0.6,
  },
  workoutIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  workoutName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  workoutCalories: {
    fontSize: 12,
    color: "#64748B",
  },
  recentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  // ✅ Новые стили для заголовка с кнопкой очистки
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  workoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  workoutInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  workoutItemIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  workoutDetails: {
    flex: 1,
  },
  workoutItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  workoutItemTime: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  workoutStats: {
    alignItems: "flex-end",
  },
  workoutDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  workoutCaloriesText: {
    fontSize: 13,
    color: "#64748B",
  },
  noWorkoutsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noWorkoutsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  noWorkoutsSubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: Math.min(width - 32, 360),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalWorkoutTypes: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  modalWorkoutType: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedWorkoutType: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  modalWorkoutIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  modalWorkoutName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#F8FAFC",
    marginBottom: 20,
    marginHorizontal: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  addWorkoutButton: {
    backgroundColor: "#3B82F6",
  },
  addWorkoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});