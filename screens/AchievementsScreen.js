// screens/AchievementsScreen.js — Экран достижений и бейджей
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
} from "react-native";
import { ArrowLeft, Trophy, Lock, Star, TrendingUp } from "lucide-react-native";
import {
  ACHIEVEMENTS,
  getUserAchievements,
  getAchievementProgress,
  getAchievementsOverview,
  markAchievementAsSeen,
} from "../utils/achievementsUtils";

const { width } = Dimensions.get("window");

const C = {
  bg: "#EEF2FF",
  card: "#FFFFFF",
  border: "#E4E7EC",
  text: "#0B1220",
  sub: "#667085",
  primary: "#5B7CFF",
  accent: "#3F8CFF",
  success: "#22C55E",
  gold: "#FFD700",
};

export default function AchievementsScreen({ navigation }) {
  const [userAchievements, setUserAchievements] = useState({});
  const [achievementsList, setAchievementsList] = useState([]);
  const [overview, setOverview] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unlocked, locked

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const unlocked = await getUserAchievements();
    const stats = await getAchievementsOverview();
    
    setUserAchievements(unlocked);
    setOverview(stats);

    // Загрузить все достижения с прогрессом
    const allAchievements = Object.values(ACHIEVEMENTS);
    const achievementsWithProgress = await Promise.all(
      allAchievements.map(async (achievement) => {
        const progress = await getAchievementProgress(achievement);
        return {
          ...achievement,
          ...progress,
          unlockedAt: unlocked[achievement.id]?.unlockedAt,
          isSeen: unlocked[achievement.id]?.seen,
        };
      })
    );

    // Сортировка: сначала разблокированные, затем по прогрессу
    achievementsWithProgress.sort((a, b) => {
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      if (a.isUnlocked && b.isUnlocked) {
        return new Date(b.unlockedAt) - new Date(a.unlockedAt);
      }
      return b.progress - a.progress;
    });

    setAchievementsList(achievementsWithProgress);
  };

  const handleAchievementPress = async (achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
    
    // Отметить как просмотренное
    if (achievement.isUnlocked && !achievement.isSeen) {
      await markAchievementAsSeen(achievement.id);
      loadAchievements(); // Перезагрузить
    }
  };

  const filteredAchievements = achievementsList.filter((a) => {
    if (filter === "unlocked") return a.isUnlocked;
    if (filter === "locked") return !a.isUnlocked;
    return true;
  });

  const getCategoryName = (category) => {
    switch (category) {
      case "special":
        return "Особые";
      case "streak":
        return "Последовательность";
      case "water":
        return "Вода";
      case "calories_weekly":
        return "Калории (неделя)";
      case "calories_total":
        return "Калории (всего)";
      case "workouts":
        return "Тренировки";
      default:
        return "Другое";
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Достижения</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Overview Card */}
          {overview && (
            <View style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <Trophy size={28} color={C.gold} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.overviewTitle}>Твоя коллекция</Text>
                  <Text style={styles.overviewSub}>
                    {overview.unlockedCount} из {overview.totalAchievements} разблокировано
                  </Text>
                </View>
                {overview.unseenCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{overview.unseenCount}</Text>
                  </View>
                )}
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(overview.unlockedCount / overview.totalAchievements) * 100}%`,
                    },
                  ]}
                />
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🔥</Text>
                  <Text style={styles.statValue}>{overview.currentStreak}</Text>
                  <Text style={styles.statLabel}>Дней подряд</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>💧</Text>
                  <Text style={styles.statValue}>{overview.totalWaterLiters.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Литров воды</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⚡</Text>
                  <Text style={styles.statValue}>{overview.totalCaloriesBurned}</Text>
                  <Text style={styles.statLabel}>Ккал сожжено</Text>
                </View>
              </View>
            </View>
          )}

          {/* Filter Tabs */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterBtn, filter === "all" && styles.filterBtnActive]}
              onPress={() => setFilter("all")}
            >
              <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
                Все
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filter === "unlocked" && styles.filterBtnActive]}
              onPress={() => setFilter("unlocked")}
            >
              <Text style={[styles.filterText, filter === "unlocked" && styles.filterTextActive]}>
                Открытые
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, filter === "locked" && styles.filterBtnActive]}
              onPress={() => setFilter("locked")}
            >
              <Text style={[styles.filterText, filter === "locked" && styles.filterTextActive]}>
                Закрытые
              </Text>
            </TouchableOpacity>
          </View>

          {/* Achievements Grid */}
          <View style={styles.grid}>
            {filteredAchievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.isUnlocked && styles.achievementCardLocked,
                ]}
                onPress={() => handleAchievementPress(achievement)}
              >
                {/* New Badge */}
                {achievement.isUnlocked && !achievement.isSeen && (
                  <View style={styles.newBadge}>
                    <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                  </View>
                )}

                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.isUnlocked ? achievement.color : "#E5E7EB" },
                  ]}
                >
                  <Text style={styles.achievementEmoji}>
                    {achievement.isUnlocked ? achievement.icon : "🔒"}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.isUnlocked && styles.achievementTitleLocked,
                  ]}
                  numberOfLines={1}
                >
                  {achievement.title}
                </Text>

                {achievement.isUnlocked ? (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedText}>✓ Получено</Text>
                  </View>
                ) : (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarSmall}>
                      <View
                        style={[styles.progressBarSmallFill, { width: `${achievement.progress}%` }]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {achievement.current}/{achievement.threshold}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Achievement Detail Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            {selectedAchievement && (
              <View style={styles.modalCard}>
                <View
                  style={[
                    styles.modalIcon,
                    {
                      backgroundColor: selectedAchievement.isUnlocked
                        ? selectedAchievement.color
                        : "#E5E7EB",
                    },
                  ]}
                >
                  <Text style={styles.modalEmoji}>
                    {selectedAchievement.isUnlocked ? selectedAchievement.icon : "🔒"}
                  </Text>
                </View>

                <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.modalDescription}>{selectedAchievement.description}</Text>

                <View style={styles.modalCategory}>
                  <Text style={styles.modalCategoryText}>
                    {getCategoryName(selectedAchievement.category)}
                  </Text>
                </View>

                {selectedAchievement.isUnlocked ? (
                  <View style={styles.modalStats}>
                    <View style={styles.modalStatItem}>
                      <Text style={styles.modalStatLabel}>Разблокировано</Text>
                      <Text style={styles.modalStatValue}>
                        {formatDate(selectedAchievement.unlockedAt)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.modalProgress}>
                    <View style={styles.modalProgressBar}>
                      <View
                        style={[
                          styles.modalProgressFill,
                          { width: `${selectedAchievement.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.modalProgressText}>
                      {selectedAchievement.current} / {selectedAchievement.threshold}
                    </Text>
                    <Text style={styles.modalProgressPercent}>
                      {selectedAchievement.progress.toFixed(0)}% выполнено
                    </Text>
                  </View>
                )}

                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseBtnText}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: C.text },

  // Overview Card
  overviewCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  overviewTitle: { fontSize: 20, fontWeight: "800", color: C.text },
  overviewSub: { fontSize: 14, color: C.sub, marginTop: 2 },
  badge: {
    backgroundColor: C.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

  progressBarBg: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: C.gold,
    borderRadius: 999,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: "800", color: C.text },
  statLabel: { fontSize: 11, color: C.sub, marginTop: 2, textAlign: "center" },

  // Filter
  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  filterBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterText: { fontSize: 14, fontWeight: "700", color: C.text },
  filterTextActive: { color: "#FFF" },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  achievementCard: {
    width: (width - 44) / 2,
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    position: "relative",
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  newBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  achievementIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementEmoji: { fontSize: 36 },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
    marginBottom: 8,
  },
  achievementTitleLocked: {
    color: C.sub,
  },
  unlockedBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },

  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBarSmall: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarSmallFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 999,
  },
  progressText: {
    fontSize: 11,
    color: C.sub,
    fontWeight: "700",
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    width: Math.min(width - 32, 360),
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalEmoji: { fontSize: 48 },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: C.sub,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  modalCategory: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.text,
  },
  modalStats: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  modalStatItem: {
    alignItems: "center",
  },
  modalStatLabel: {
    fontSize: 13,
    color: C.sub,
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  modalProgress: {
    width: "100%",
    marginBottom: 20,
  },
  modalProgressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 12,
  },
  modalProgressFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 999,
  },
  modalProgressText: {
    fontSize: 14,
    color: C.text,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  modalProgressPercent: {
    fontSize: 13,
    color: C.sub,
    textAlign: "center",
  },
  modalCloseBtn: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
  },
});

