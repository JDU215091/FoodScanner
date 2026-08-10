// screens/CalendarScreen.js
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Calendar, ChevronLeft, ChevronRight, Activity, Droplet, Target } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const R = 22;
const C = { bg:"#EEF2FF", card:"#FFFFFF", border:"#E4E7EC", text:"#0B1220", sub:"#667085", primary:"#5B7CFF" };

const { width } = Dimensions.get("window");

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyData, setDailyData] = useState({});

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("calendarData");
      if (savedData) setDailyData(JSON.parse(savedData));
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0=Вс

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const formatDateKey = (date) => date.toISOString().split("T")[0];
  const isToday = (date) => new Date().toDateString() === date.toDateString();
  const isSelected = (date) => !!date && date.toDateString() === selectedDate.toDateString();
  const getDayData = (date) => {
    if (!date) return { calories: 0, water: 0, workouts: 0 };
    return dailyData[formatDateKey(date)] || { calories: 0, water: 0, workouts: 0 };
  };

  const navigateMonth = (direction) => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(next);
  };

  const monthNames = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
  ];
  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  const selectedDayData = getDayData(selectedDate);
  const cellSize = Math.floor((width - 32) / 7);
  const cellHeight = cellSize;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Calendar size={20} color={C.text} />
              <Text style={styles.headerTitle}>Календарь</Text>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthHeader}>
              <TouchableOpacity style={styles.monthNavButton} onPress={() => navigateMonth(-1)}>
                <ChevronLeft size={16} color={C.text} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity style={styles.monthNavButton} onPress={() => navigateMonth(1)}>
                <ChevronRight size={16} color={C.text} />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarContainer}>
              <View style={styles.dayHeaderRow}>
                {dayNames.map((day, index) => (
                  <View key={index} style={[styles.dayHeaderCell, { width: cellSize }]}>
                    <Text style={styles.dayHeaderText}>{day}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <View key={index} style={[styles.emptyDay, { width: cellSize, height: cellHeight }]} />;
                  }

                  const dayData = getDayData(date);
                  const hasData = dayData.calories > 0 || dayData.water > 0 || dayData.workouts > 0;
                  const today = isToday(date);
                  const selected = isSelected(date);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCell,
                        { width: cellSize, height: cellHeight },
                        today && styles.todayCell,
                        selected && styles.selectedCell,
                      ]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[styles.dayText, today && styles.todayText, selected && styles.selectedText]}>
                        {date.getDate()}
                      </Text>
                      {hasData && <View style={styles.dataIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Day Details */}
            <View style={styles.dayDetailsContainer}>
              <Text style={styles.dayDetailsTitle}>
                {selectedDate.toLocaleDateString("ru-RU", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Target size={16} color="#EF4444" />
                  <Text style={styles.statValue}>{selectedDayData.calories}</Text>
                  <Text style={styles.statLabel}>Калории</Text>
                </View>
                <View style={styles.statCard}>
                  <Droplet size={16} color={C.primary} />
                  <Text style={styles.statValue}>{selectedDayData.water.toFixed(1)} л</Text>
                  <Text style={styles.statLabel}>Вода</Text>
                </View>
                <View style={styles.statCard}>
                  <Activity size={16} color="#22C55E" />
                  <Text style={styles.statValue}>{selectedDayData.workouts}</Text>
                  <Text style={styles.statLabel}>Тренировки</Text>
                </View>
              </View>

              {selectedDayData.calories === 0 &&
                selectedDayData.water === 0 &&
                selectedDayData.workouts === 0 && (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>Нет данных за этот день</Text>
                    <Text style={styles.noDataSubtext}>Начните отслеживать свою активность</Text>
                  </View>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Быстрые действия</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => navigation.navigate("AddFood")}
                >
                  <Text style={styles.quickActionText}>Добавить еду</Text>
                </TouchableOpacity>

                {/* Открываем WorkoutDetail в режиме создания */}
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() =>
                    navigation.navigate("WorkoutDetail", {
                      date: selectedDate.toISOString(), // передаём дату
                      source: "Calendar",
                    })
                  }
                >
                  <Text style={styles.quickActionText}>Записать тренировку</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  safeArea: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },

  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: C.text },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderRadius: R,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F7F8FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  monthTitle: { fontSize: 16, fontWeight: "800", color: C.text },

  calendarContainer: {
    backgroundColor: C.card,
    borderRadius: R,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  dayHeaderRow: { flexDirection: "row", paddingHorizontal: 8, marginBottom: 4 },
  dayHeaderCell: { alignItems: "center", paddingVertical: 6 },
  dayHeaderText: { fontSize: 12, color: C.sub },

  calendarGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8, gap: 6 },
  emptyDay: { backgroundColor: "transparent" },
  dayCell: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFF",
    borderWidth: 1,
    borderColor: C.border,
  },
  todayCell: { borderColor: C.primary },
  selectedCell: { backgroundColor: "#E8ECFF", borderColor: C.primary },

  dayText: { fontSize: 14, color: C.text, fontWeight: "700" },
  todayText: { color: C.primary },
  selectedText: { color: C.primary },

  dataIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginTop: 4 },

  dayDetailsContainer: {
    backgroundColor: C.card,
    borderRadius: R,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  dayDetailsTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 10 },

  statsGrid: { flexDirection: "row", justifyContent: "space-between" },
  statCard: {
    width: "32%",
    borderRadius: 16,
    backgroundColor: "#FAFAFF",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: C.text, marginVertical: 6 },
  statLabel: { fontSize: 12, color: C.sub },

  noDataContainer: { alignItems: "center", paddingVertical: 8 },
  noDataText: { color: C.text, fontWeight: "700" },
  noDataSubtext: { color: C.sub, marginTop: 2 },

  quickActionsContainer: { marginTop: 6 },
  quickActionsTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 8 },
  quickActionsGrid: { flexDirection: "row", gap: 12 },
  quickActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: { color: "#fff", fontWeight: "800" },
});
