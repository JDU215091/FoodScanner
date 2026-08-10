// screens/StatsScreen.js — реальные данные из AsyncStorage (калории, вода, тренировки) — JS без TypeScript
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Flame, Activity, Droplet, ArrowLeft, BarChart3 } from "lucide-react-native";

const { width } = Dimensions.get("window");

// Дизайн-токены
const C = {
  bg: "#EEF2FF",
  card: "#FFFFFF",
  border: "#E4E7EC",
  text: "#0B1220",
  sub: "#667085",
  primary: "#5B7CFF",
  red: "#EF4444",
  green: "#22C55E",
  blue: "#3B82F6",
};
const R = 22;

// ---------- helpers по датам ----------
function isoDay(d) {
  const date = typeof d === "string" ? new Date(d) : d;
  const only = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return only.toISOString().split("T")[0];
}
function daysBack(n) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() - n);
  return base;
}
function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthShortRu(m) {
  return ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"][m];
}
function generateYearMonthKeys() {
  const arr = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    d.setHours(0, 0, 0, 0);
    arr.push(monthKey(d));
  }
  return arr;
}
function weekDays() {
  const today = daysBack(0);
  const weekday = (today.getDay() + 6) % 7; // 0..6, где 0 — Пн
  const monday = daysBack(weekday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => daysBack(n - 1 - i));
}

export default function StatsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("calories"); // 'calories' | 'workouts' | 'water'
  const [timeRange, setTimeRange] = useState("week"); // 'week' | 'month' | 'year'

  // Сырые данные
  const [workouts, setWorkouts] = useState([]); // массив тренировок
  const [waterGlasses, setWaterGlasses] = useState({}); // { 'YYYY-MM-DD': [{amount: number}, ...] }
  const [foodByDate, setFoodByDate] = useState({}); // { 'YYYY-MM-DD': sumCalories }

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      // ---- Тренировки
      const savedWorkouts = await AsyncStorage.getItem("workouts");
      setWorkouts(savedWorkouts ? JSON.parse(savedWorkouts) : []);

      // ---- Вода
      const savedWater = await AsyncStorage.getItem("waterGlasses");
      setWaterGlasses(savedWater ? JSON.parse(savedWater) : {});

      // ---- Еда (калории)
      let caloriesMap = {};
      const logCandidates = ["foodLog", "food_logs", "meals"];
      let foundLog = null;

      for (const key of logCandidates) {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              foundLog = parsed; // массив записей с датами
              break;
            }
            // Объект вида { '2025-10-31': [{name, calories}, ...], ... }
            if (parsed && typeof parsed === "object") {
              Object.entries(parsed).forEach(([day, arr]) => {
                if (Array.isArray(arr)) {
                  const sum = arr.reduce(
                    (s, f) => s + (parseFloat(f?.calories) || 0),
                    0
                  );
                  caloriesMap[day] = (caloriesMap[day] || 0) + sum;
                }
              });
              foundLog = []; // помечаем, что источник найден
              break;
            }
          } catch {
            // ignore
          }
        }
      }

      if (foundLog && Array.isArray(foundLog)) {
        foundLog.forEach((item) => {
          const day = item?.date ? isoDay(item.date) : isoDay(new Date());
          const cal = Number(item?.calories) || 0;
          caloriesMap[day] = (caloriesMap[day] || 0) + cal;
        });
      }

      // fallback — если нет подробных логов, пробуем общий "caloriesEaten" на сегодня
      if (!foundLog) {
        const today = isoDay(new Date());
        const ce = await AsyncStorage.getItem("caloriesEaten");
        if (ce) caloriesMap[today] = Number(ce) || 0;
      }

      setFoodByDate(caloriesMap);
    } catch (e) {
      console.log("Error loading stats:", e);
    }
  }

  // -------- агрегирование под выбранный диапазон --------
  const series = useMemo(() => {
    if (timeRange === "week") {
      const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
      const days = weekDays();

      const calories = days.map((d) => foodByDate[isoDay(d)] || 0);
      const water = days.map((d) => {
        const arr = waterGlasses[isoDay(d)] || [];
        return arr.reduce((s, g) => s + (Number(g.amount) || 0), 0); // литры
      });
      const workoutsCount = days.map((d) => {
        const dayKey = isoDay(d);
        return workouts.filter((w) =>
          (w.date ? isoDay(w.date) : isoDay(new Date())) === dayKey
        ).length;
      });

      return { labels, calories, water, workouts: workoutsCount };
    }

    if (timeRange === "month") {
      const days = lastNDays(30);
      const labels = days.map((d) => String(d.getDate()));
      const calories = days.map((d) => foodByDate[isoDay(d)] || 0);
      const water = days.map((d) => {
        const arr = waterGlasses[isoDay(d)] || [];
        return arr.reduce((s, g) => s + (Number(g.amount) || 0), 0);
      });
      const workoutsCount = days.map((d) => {
        const dayKey = isoDay(d);
        return workouts.filter((w) =>
          (w.date ? isoDay(w.date) : isoDay(new Date())) === dayKey
        ).length;
      });
      return { labels, calories, water, workouts: workoutsCount };
    }

    // year
    const months = [];
    const labels = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i, 1);
      d.setHours(0, 0, 0, 0);
      months.push(monthKey(d));
      labels.push(monthShortRu(d.getMonth()));
    }

    const caloriesMap = {};
    Object.entries(foodByDate).forEach(([day, cal]) => {
      const d = new Date(day);
      const key = monthKey(d);
      caloriesMap[key] = (caloriesMap[key] || 0) + (Number(cal) || 0);
    });

    const waterMap = {};
    Object.entries(waterGlasses).forEach(([day, arr]) => {
      const d = new Date(day);
      const key = monthKey(d);
      const sum = (arr || []).reduce(
        (s, g) => s + (Number(g.amount) || 0),
        0
      );
      waterMap[key] = (waterMap[key] || 0) + sum;
    });

    const workoutsMap = {};
    workouts.forEach((w) => {
      const d = new Date(w?.date || new Date());
      const key = monthKey(d);
      workoutsMap[key] = (workoutsMap[key] || 0) + 1;
    });

    return {
      labels,
      calories: months.map((m) => caloriesMap[m] || 0),
      water: months.map((m) => waterMap[m] || 0),
      workouts: months.map((m) => workoutsMap[m] || 0),
    };
  }, [timeRange, foodByDate, waterGlasses, workouts]);

  // -------- сводка --------
  const summary = useMemo(() => {
    const arr =
      activeTab === "calories"
        ? series.calories
        : activeTab === "water"
        ? series.water
        : series.workouts;

    const total = arr.reduce((s, v) => s + v, 0);
    const avg = arr.length ? total / arr.length : 0;

    // Доп. сводка для тренировок — суммарные ккал
    let workoutsCaloriesTotal = 0;
    if (activeTab === "workouts") {
      if (timeRange === "year") {
        const keys = generateYearMonthKeys();
        keys.forEach((key) => {
          workoutsCaloriesTotal += workouts
            .filter((w) => monthKey(new Date(w?.date || new Date())) === key)
            .reduce((s, w) => s + (Number(w?.calories) || 0), 0);
        });
      } else {
        const days = timeRange === "week" ? weekDays() : lastNDays(30);
        days.forEach((d) => {
          const dayKey = isoDay(d);
          workoutsCaloriesTotal += workouts
            .filter((w) => (w.date ? isoDay(w.date) : isoDay(new Date())) === dayKey)
            .reduce((s, w) => s + (Number(w?.calories) || 0), 0);
        });
      }
    }

    return {
      total,
      average:
        activeTab === "workouts"
          ? avg.toFixed(1)
          : activeTab === "water"
          ? avg.toFixed(2)
          : Math.round(avg),
      workoutsCaloriesTotal,
    };
  }, [series, activeTab, timeRange, workouts]);

  // -------- рендер графика (простые bar'ы) --------
  function getMaxValue() {
    const data =
      activeTab === "calories"
        ? series.calories
        : activeTab === "water"
        ? series.water
        : series.workouts;
    const max = Math.max(...data, 1);
    return max * 1.2;
  }
  function getBarColor() {
    if (activeTab === "calories") return C.red;
    if (activeTab === "workouts") return C.green;
    if (activeTab === "water") return C.blue;
    return C.primary;
  }
  function formatValue(v) {
    if (activeTab === "water") return `${v.toFixed(0)} л`;
    if (activeTab === "workouts") return `${v}`;
    return `${v} ккал`;
  }

  function renderChart() {
    const data =
      activeTab === "calories"
        ? series.calories
        : activeTab === "water"
        ? series.water
        : series.workouts;
    const labels = series.labels;
    const maxValue = getMaxValue();
    const barColor = getBarColor();
    const barWidth = timeRange === "week" ? 28 : timeRange === "month" ? 8 : 18;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>{formatValue(Math.round(maxValue))}</Text>
          <Text style={styles.axisLabel}>{formatValue(Math.round(maxValue / 2))}</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
          <View style={styles.chart}>
            {data.map((value, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(value / maxValue) * 100}%`,
                        backgroundColor: barColor,
                        width: barWidth,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.xAxisLabel}>{labels[index]}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  const unitLabel =
    activeTab === "calories" ? "ккал" : activeTab === "water" ? "литров" : "тренировок";
  const tabTitle =
    activeTab === "calories" ? "Калории" : activeTab === "water" ? "Вода" : "Тренировки";

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={C.text} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Статистика</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              {["calories", "workouts", "water"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  {tab === "calories" && (
                    <Flame size={18} color={activeTab === tab ? C.red : "#6b7280"} />
                  )}
                  {tab === "workouts" && (
                    <Activity size={18} color={activeTab === tab ? C.green : "#6b7280"} />
                  )}
                  {tab === "water" && (
                    <Droplet size={18} color={activeTab === tab ? C.blue : "#6b7280"} />
                  )}
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab === "calories" ? "Калории" : tab === "workouts" ? "Тренировки" : "Вода"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time ranges */}
            <View style={styles.timeRangeContainer}>
              {["week", "month", "year"].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRange]}
                  onPress={() => setTimeRange(range)}
                >
                  <Text
                    style={[styles.timeRangeText, timeRange === range && styles.activeTimeRangeText]}
                  >
                    {range === "week" ? "Неделя" : range === "month" ? "Месяц" : "Год"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryHeader}>
                <BarChart3 size={18} color={C.text} />
                <Text style={styles.summaryTitle}>Сводка</Text>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Всего {unitLabel}</Text>
                  <Text style={styles.summaryValue}>
                    {activeTab === "water"
                      ? summary.total.toFixed(2)
                      : activeTab === "workouts"
                      ? summary.total
                      : Math.round(summary.total)}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>В среднем</Text>
                  <Text style={styles.summaryValue}>{summary.average}</Text>
                </View>

                {activeTab === "workouts" && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Ккал за тренировки</Text>
                    <Text style={styles.summaryValue}>
                      {Math.round(summary.workoutsCaloriesTotal)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                {tabTitle} за {timeRange === "week" ? "неделю" : timeRange === "month" ? "месяц" : "год"}
              </Text>
              {renderChart()}
            </View>

            {/* Insights */}
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>Аналитика</Text>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  {activeTab === "calories"
                    ? "Отслеживайте баланс калорий: если среднее выше цели — попробуйте уменьшить калорийность рационов."
                    : activeTab === "workouts"
                    ? "Старайтесь поддерживать регулярность: 3–4 тренировки в неделю — отличный ориентир."
                    : "Поддерживайте водный баланс: ориентир — около 2 литров в день, учитывая активность и климат."}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ============ Styles ============
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safeArea: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },

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

  container: { padding: 16, paddingBottom: 120 },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 999,
    padding: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: C.border,
  },
  tabText: { color: "#334155", fontWeight: "700", fontSize: 14 },
  activeTabText: { color: C.text },

  // Time range
  timeRangeContainer: { flexDirection: "row", gap: 8, marginBottom: 12 },
  timeRangeButton: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FF",
    borderWidth: 1,
    borderColor: C.border,
  },
  activeTimeRange: { backgroundColor: "#FFFFFF" },
  timeRangeText: { color: "#334155", fontWeight: "700" },
  activeTimeRangeText: { color: C.text },

  // Summary
  summaryContainer: {
    backgroundColor: C.card,
    borderRadius: R,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  summaryTitle: { fontSize: 16, fontWeight: "800", color: C.text },
  summaryGrid: { flexDirection: "row", gap: 12 },
  summaryItem: {
    flex: 1,
    backgroundColor: "#FAFAFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    paddingVertical: 10,
  },
  summaryLabel: { color: C.sub, fontSize: 12, marginBottom: 4, textAlign: "center" },
  summaryValue: { color: C.text, fontWeight: "800", fontSize: 18 },

  // Chart
  chartCard: {
    backgroundColor: C.card,
    borderRadius: R,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },
  chartTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 8 },
  chartContainer: { flexDirection: "row", minHeight: 220, marginTop: 4 },
  yAxisLabels: { width: 48, justifyContent: "space-between", alignItems: "flex-end", paddingVertical: 6 },
  axisLabel: { color: C.sub, fontSize: 12 },
  chartScrollView: { flex: 1 },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingBottom: 6 },
  barContainer: { alignItems: "center" },
  barWrapper: {
    backgroundColor: "#F5F6FE",
    width: 30,
    height: 180,
    borderRadius: 12,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: { borderRadius: 10 },
  xAxisLabel: { color: C.sub, fontSize: 11, marginTop: 6, textAlign: "center" },

  // Insights
  insightsContainer: {
    backgroundColor: C.card,
    borderRadius: R,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },
  insightsTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 8 },
  insightCard: {
    backgroundColor: "#FAFAFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  insightText: { fontSize: 14, lineHeight: 20, color: C.text },
});
