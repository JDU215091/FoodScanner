// screens/ProfileScreen.js
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
  Image,
} from "react-native";
import {
  User,
  Edit3,
  Save,
  Activity,
  Target,
  TrendingUp,
  Award,
  Upload,
  LogOut,
  X,
  Trash2,
  Trophy,
  Bell,
  ChevronRight,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../auth/AuthProvider";
import { useNavigation } from "@react-navigation/native";
import { 
  getAchievementsOverview,
  unlockTestAchievements,
  resetAllAchievements,
  unlockAllAchievements,
} from "../utils/achievementsUtils";
import { achievementToastState } from "../App";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState({
    name: "Пользователь",
    email: "",
    age: 25,
    weight: 70,
    height: 175,
    goal: "Поддержание веса",
    calorieGoal: 2000,
    profileImage: null,
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editProfile, setEditProfile] = useState({});
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    averageWater: 0,
    streakDays: 0,
  });
  const [achievementsStats, setAchievementsStats] = useState(null);
  const [testButtonPresses, setTestButtonPresses] = useState(0);

  useEffect(() => {
    loadProfile();
    loadStats();
    loadAchievementsData();
    requestMediaLibraryPermissions();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Перезагружаем достижения при возврате на экран
      loadAchievementsData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const saveProfileData = async () => {
      try {
        await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));
      } catch (error) {
        console.error("Error auto-saving profile:", error);
      }
    };
    saveProfileData();
  }, [userProfile]);

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Разрешение", "Для загрузки фото разрешите доступ к галерее");
    }
  };

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("userProfile");
      const savedEmail = await AsyncStorage.getItem("userEmail");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUserProfile({ ...profile, email: savedEmail || "" });
      } else if (savedEmail) {
        setUserProfile((prev) => ({ ...prev, email: savedEmail }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadStats = async () => {
    try {
      const workouts = await AsyncStorage.getItem("workouts");
      const caloriesBurned = await AsyncStorage.getItem("caloriesBurned");
      const waterGlasses = await AsyncStorage.getItem("waterGlasses");

      if (workouts) {
        const workoutData = JSON.parse(workouts);
        setStats((prev) => ({
          ...prev,
          totalWorkouts: workoutData.length,
          totalCaloriesBurned: workoutData.reduce(
            (total, w) => total + (w.calories || 0),
            0
          ),
        }));
      }

      if (caloriesBurned) {
        setStats((prev) => ({
          ...prev,
          totalCaloriesBurned: parseInt(caloriesBurned, 10) || 0,
        }));
      }

      if (waterGlasses) {
        const waterData = JSON.parse(waterGlasses);
        const totalWater = Object.values(waterData).reduce(
          (total, day) =>
            total +
            (day || []).reduce((sum, g) => sum + (g.amount || 0), 0),
          0
        );
        const days = Object.keys(waterData).length;
        setStats((prev) => ({
          ...prev,
          averageWater: days > 0 ? (totalWater / days).toFixed(1) : 0,
        }));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadAchievementsData = async () => {
    try {
      const overview = await getAchievementsOverview();
      setAchievementsStats(overview);
      setStats((prev) => ({
        ...prev,
        streakDays: overview.currentStreak,
      }));
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
  };

  // Тестовые функции для разблокировки достижений
  const handleTestAchievements = async () => {
    try {
      const newAchievements = await unlockTestAchievements();
      await loadAchievementsData();
      
      // Показать Toast для первого достижения
      if (newAchievements.length > 0) {
        achievementToastState.show(newAchievements[0]);
      }
      
      Alert.alert(
        "✅ Тест успешен!",
        `Разблокировано ${newAchievements.length} достижений:\n` +
        newAchievements.map(a => `${a.icon} ${a.title}`).join('\n')
      );
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось разблокировать достижения");
    }
  };

  const handleResetAchievements = async () => {
    Alert.alert(
      "Сброс достижений",
      "Удалить все достижения?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить",
          style: "destructive",
          onPress: async () => {
            await resetAllAchievements();
            await loadAchievementsData();
            Alert.alert("✅", "Достижения сброшены");
          },
        },
      ]
    );
  };

  const handleUnlockAll = async () => {
    Alert.alert(
      "Разблокировать всё",
      "Разблокировать все 14 достижений?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Разблокировать",
          onPress: async () => {
            await unlockAllAchievements();
            await loadAchievementsData();
            Alert.alert("🎉", "Все достижения разблокированы!");
          },
        },
      ]
    );
  };

  // Секретная активация (нажать на заголовок 5 раз)
  const handleHeaderPress = () => {
    const newCount = testButtonPresses + 1;
    setTestButtonPresses(newCount);
    
    if (newCount === 5) {
      Alert.alert(
        "🎮 Режим тестирования",
        "Выберите действие:",
        [
          {
            text: "🎯 Разблокировать 4 достижения",
            onPress: handleTestAchievements,
          },
          {
            text: "🎉 Разблокировать ВСЁ (14)",
            onPress: handleUnlockAll,
          },
          {
            text: "🔄 Сбросить всё",
            onPress: handleResetAchievements,
          },
          { text: "Отмена", style: "cancel" },
        ]
      );
      setTestButtonPresses(0);
    }
    
    // Сброс счетчика через 2 секунды
    setTimeout(() => setTestButtonPresses(0), 2000);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled && result.assets?.[0]) {
        const uri = result.assets[0].uri;
        setEditProfile((p) => ({ ...p, profileImage: uri }));
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось загрузить изображение");
    }
  };

  const clearProfilePhoto = async () => {
    try {
      // Обнуляем в состоянии модалки
      setEditProfile((p) => ({ ...p, profileImage: null }));
      // Мгновенно сохраняем и сразу обновляем карточку профиля
      const updated = { ...userProfile, profileImage: null };
      await AsyncStorage.setItem("userProfile", JSON.stringify(updated));
      setUserProfile(updated);
      Alert.alert("Готово", "Фото профиля удалено");
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось удалить фото");
    }
  };

  const openEditModal = () => {
    setEditProfile({ ...userProfile });
    setIsEditModalVisible(true);
  };

  const cancelEdit = () => {
    setEditProfile({});
    setIsEditModalVisible(false);
  };

  const saveProfile = async () => {
    if (
      !editProfile.name ||
      !editProfile.age ||
      !editProfile.weight ||
      !editProfile.height
    ) {
      Alert.alert("Ошибка", "Заполните все обязательные поля");
      return;
    }

    try {
      const updated = { ...editProfile };
      await AsyncStorage.setItem("userProfile", JSON.stringify(updated));
      setUserProfile(updated);
      setIsEditModalVisible(false);
      setEditProfile({});
      Alert.alert("Успех", "Профиль обновлён");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сохранить профиль");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: async () => {
          await signOut();
          await AsyncStorage.removeItem("userEmail");
          navigation.replace("Login");
        },
      },
    ]);
  };

  const calculateBMI = () => {
    const h = userProfile.height / 100;
    const bmi = userProfile.weight / (h * h);
    return isNaN(bmi) ? "0.0" : bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { text: "Недостаток веса", color: "#60a5fa" };
    if (bmi < 25) return { text: "Норма", color: "#22C55E" };
    if (bmi < 30) return { text: "Избыток", color: "#fbbf24" };
    return { text: "Ожирение", color: "#EF4444" };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(parseFloat(bmi));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#E9EEFF" />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleHeaderPress} activeOpacity={0.9}>
            <Text style={styles.headerTitle}>Профиль</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Edit3 size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                {userProfile.profileImage ? (
                  <Image
                    source={{ uri: userProfile.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <User size={40} color="#94A3B8" />
                )}
              </View>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userEmail}>{userProfile.email || "Нет email"}</Text>
              <Text style={styles.userGoal}>{userProfile.goal}</Text>

              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>{userProfile.age}</Text>
                  <Text style={styles.profileStatLabel}>лет</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>{userProfile.weight}</Text>
                  <Text style={styles.profileStatLabel}>кг</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>{userProfile.height}</Text>
                  <Text style={styles.profileStatLabel}>см</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogOut size={16} color="#EF4444" />
                <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
              </TouchableOpacity>
            </View>

            {/* BMI Card */}
            <View style={styles.bmiCard}>
              <Text style={styles.sectionTitle}>ИМТ</Text>
              <View style={styles.bmiContent}>
                <Text style={styles.bmiValue}>{bmi}</Text>
                <View style={styles.bmiCategory}>
                  <View
                    style={[
                      styles.bmiIndicator,
                      { backgroundColor: bmiCategory.color },
                    ]}
                  />
                  <Text
                    style={[styles.bmiCategoryText, { color: bmiCategory.color }]}
                  >
                    {bmiCategory.text}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Статистика</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Activity size={24} color="#22C55E" />
                  <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
                  <Text style={styles.statLabel}>Тренировки</Text>
                </View>
                <View style={styles.statCard}>
                  <Target size={24} color="#EF4444" />
                  <Text style={styles.statValue}>{stats.totalCaloriesBurned}</Text>
                  <Text style={styles.statLabel}>Калории</Text>
                </View>
                <View style={styles.statCard}>
                  <TrendingUp size={24} color="#3B82F6" />
                  <Text style={styles.statValue}>{stats.streakDays}</Text>
                  <Text style={styles.statLabel}>Дни подряд</Text>
                </View>
                <View style={styles.statCard}>
                  <Award size={24} color="#fbbf24" />
                  <Text style={styles.statValue}>
                    {achievementsStats?.unlockedCount || 0}
                  </Text>
                  <Text style={styles.statLabel}>Достижения</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Быстрые действия</Text>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate("Achievements")}
              >
                <View style={styles.actionLeft}>
                  <View style={[styles.actionIcon, { backgroundColor: "#FFF4ED" }]}>
                    <Trophy size={22} color="#F97316" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Достижения</Text>
                    <Text style={styles.actionSubtitle}>
                      {achievementsStats?.unlockedCount || 0} из {achievementsStats?.totalAchievements || 0} разблокировано
                    </Text>
                  </View>
                </View>
                {achievementsStats?.unseenCount > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{achievementsStats.unseenCount}</Text>
                  </View>
                )}
                <ChevronRight size={20} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate("Notifications")}
              >
                <View style={styles.actionLeft}>
                  <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
                    <Bell size={22} color="#5B7CFF" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Уведомления</Text>
                    <Text style={styles.actionSubtitle}>Настройки напоминаний</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Edit Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={isEditModalVisible}
          onRequestClose={cancelEdit}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Редактировать профиль</Text>
                <TouchableOpacity onPress={cancelEdit}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Фото профиля</Text>

                  <View style={styles.rowInline}>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                      <Upload size={16} color="#3B82F6" />
                      <Text style={styles.uploadButtonText}>
                        {editProfile.profileImage ? "Изменить" : "Загрузить"}
                      </Text>
                    </TouchableOpacity>

                    {(editProfile.profileImage || userProfile.profileImage) && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={clearProfilePhoto}
                      >
                        <Trash2 size={16} color="#EF4444" />
                        <Text style={styles.deleteButtonText}>Удалить фото</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {editProfile.profileImage && (
                    <Image
                      source={{ uri: editProfile.profileImage }}
                      style={styles.previewImage}
                    />
                  )}
                </View>

                <View className="inputGroup" style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Имя *</Text>
                  <TextInput
                    style={styles.input}
                    value={editProfile.name}
                    onChangeText={(t) => setEditProfile({ ...editProfile, name: t })}
                    placeholder="Имя"
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Возраст *</Text>
                    <TextInput
                      style={styles.input}
                      value={editProfile.age?.toString()}
                      onChangeText={(t) =>
                        setEditProfile({
                          ...editProfile,
                          age: parseInt(t) || 0,
                        })
                      }
                      keyboardType="numeric"
                      placeholder="Возраст"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Вес (кг) *</Text>
                    <TextInput
                      style={styles.input}
                      value={editProfile.weight?.toString()}
                      onChangeText={(t) =>
                        setEditProfile({
                          ...editProfile,
                          weight: parseInt(t) || 0,
                        })
                      }
                      keyboardType="numeric"
                      placeholder="Вес"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Рост (см) *</Text>
                    <TextInput
                      style={styles.input}
                      value={editProfile.height?.toString()}
                      onChangeText={(t) =>
                        setEditProfile({
                          ...editProfile,
                          height: parseInt(t) || 0,
                        })
                      }
                      keyboardType="numeric"
                      placeholder="Рост"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Цель калорий</Text>
                    <TextInput
                      style={styles.input}
                      value={editProfile.calorieGoal?.toString()}
                      onChangeText={(t) =>
                        setEditProfile({
                          ...editProfile,
                          calorieGoal: parseInt(t) || 0,
                        })
                      }
                      keyboardType="numeric"
                      placeholder="Калории"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Цель</Text>
                  <TextInput
                    style={styles.input}
                    value={editProfile.goal}
                    onChangeText={(t) =>
                      setEditProfile({ ...editProfile, goal: t })
                    }
                    placeholder="Цель"
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                    <Save size={16} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Сохранить</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                    <Text style={styles.cancelButtonText}>Отмена</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9EEFF" },
  safeArea: { flex: 1, backgroundColor: "#E9EEFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#E9EEFF",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1E293B" },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  userName: { fontSize: 22, fontWeight: "700", color: "#1E293B", marginBottom: 4 },
  userEmail: { fontSize: 14, color: "#64748B", marginBottom: 8 },
  userGoal: { fontSize: 14, color: "#3B82F6", fontWeight: "600", marginBottom: 16 },

  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  profileStat: { alignItems: "center" },
  profileStatValue: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  profileStatLabel: { fontSize: 12, color: "#64748B", marginTop: 4 },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignSelf: "stretch",
    justifyContent: "center",
  },
  logoutButtonText: { fontSize: 14, color: "#EF4444", fontWeight: "600", marginLeft: 8 },

  bmiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B", marginBottom: 12 },
  bmiContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bmiValue: { fontSize: 26, fontWeight: "700", color: "#1E293B" },
  bmiCategory: { flexDirection: "row", alignItems: "center" },
  bmiIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  bmiCategoryText: { fontSize: 15, fontWeight: "600" },

  statsContainer: { marginBottom: 24 },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statValue: { fontSize: 20, fontWeight: "700", color: "#1E293B", marginVertical: 6 },
  statLabel: { fontSize: 12, color: "#64748B" },

  quickActionsContainer: { marginBottom: 24 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#64748B",
  },
  actionBadge: {
    backgroundColor: "#F97316",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  actionBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  // Модалка редактирования
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
    maxHeight: height * 0.85,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },

  inputGroup: { marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  rowInline: { flexDirection: "row", gap: 10, alignItems: "center" },
  halfInput: { flex: 1 },

  inputLabel: { fontSize: 14, color: "#64748B", marginBottom: 6 },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#1E293B",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  uploadButtonText: { fontSize: 14, color: "#3B82F6", fontWeight: "600", marginLeft: 8 },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteButtonText: { fontSize: 14, color: "#EF4444", fontWeight: "700", marginLeft: 8 },

  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 14,
  },
  saveButtonText: { fontSize: 15, color: "#FFFFFF", fontWeight: "600", marginLeft: 8 },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: { fontSize: 15, color: "#64748B", fontWeight: "600" },
});
