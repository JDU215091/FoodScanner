// utils/achievementsUtils.js — Система достижений и бейджей
import AsyncStorage from "@react-native-async-storage/async-storage";

// Определение всех достижений в приложении
export const ACHIEVEMENTS = {
  // Приветственное достижение (разблокируется автоматически)
  WELCOME: {
    id: "welcome",
    title: "Добро пожаловать!",
    description: "Ты начал свой путь к здоровью и фитнесу",
    icon: "🎉",
    color: "#8B5CF6",
    threshold: 0,
    category: "special",
  },
  FIRST_STEP: {
    id: "first_step",
    title: "Первый шаг",
    description: "Открой приложение и начни отслеживать прогресс",
    icon: "👣",
    color: "#06B6D4",
    threshold: 1,
    category: "special",
  },

  // Достижения за последовательные дни
  STREAK_7: {
    id: "streak_7",
    title: "Неделя подряд",
    description: "Используй приложение 7 дней подряд",
    icon: "🔥",
    color: "#FF6B35",
    threshold: 7,
    category: "streak",
  },
  STREAK_30: {
    id: "streak_30",
    title: "Месячный марафон",
    description: "Используй приложение 30 дней подряд",
    icon: "💪",
    color: "#F77F00",
    threshold: 30,
    category: "streak",
  },
  STREAK_100: {
    id: "streak_100",
    title: "Легенда",
    description: "Используй приложение 100 дней подряд",
    icon: "👑",
    color: "#FFD700",
    threshold: 100,
    category: "streak",
  },

  // Достижения за воду
  WATER_100L: {
    id: "water_100l",
    title: "Гидратация старт",
    description: "Выпей 100 литров воды",
    icon: "💧",
    color: "#3F8CFF",
    threshold: 100,
    category: "water",
  },
  WATER_500L: {
    id: "water_500l",
    title: "Водный мастер",
    description: "Выпей 500 литров воды",
    icon: "🌊",
    color: "#0066CC",
    threshold: 500,
    category: "water",
  },
  WATER_1000L: {
    id: "water_1000l",
    title: "Океан здоровья",
    description: "Выпей 1000 литров воды",
    icon: "🏊",
    color: "#004C99",
    threshold: 1000,
    category: "water",
  },

  // Достижения за калории
  CALORIES_1000: {
    id: "calories_1000",
    title: "Первые шаги",
    description: "Сожги 1000 ккал за неделю",
    icon: "🔥",
    color: "#EF4444",
    threshold: 1000,
    category: "calories_weekly",
  },
  CALORIES_3000: {
    id: "calories_3000",
    title: "Факел энергии",
    description: "Сожги 3000 ккал за неделю",
    icon: "⚡",
    color: "#DC2626",
    threshold: 3000,
    category: "calories_weekly",
  },
  CALORIES_5000: {
    id: "calories_5000",
    title: "Пылающее сердце",
    description: "Сожги 5000 ккал за неделю",
    icon: "💥",
    color: "#B91C1C",
    threshold: 5000,
    category: "calories_weekly",
  },

  // Общие достижения за калории
  CALORIES_TOTAL_10K: {
    id: "calories_total_10k",
    title: "Марафонец",
    description: "Сожги 10,000 ккал всего",
    icon: "🏃",
    color: "#22C55E",
    threshold: 10000,
    category: "calories_total",
  },
  CALORIES_TOTAL_50K: {
    id: "calories_total_50k",
    title: "Ультрамарафонец",
    description: "Сожги 50,000 ккал всего",
    icon: "🚀",
    color: "#16A34A",
    threshold: 50000,
    category: "calories_total",
  },

  // Достижения за тренировки
  WORKOUTS_10: {
    id: "workouts_10",
    title: "Начало пути",
    description: "Завершите 10 тренировок",
    icon: "🎯",
    color: "#8B5CF6",
    threshold: 10,
    category: "workouts",
  },
  WORKOUTS_50: {
    id: "workouts_50",
    title: "Постоянство",
    description: "Завершите 50 тренировок",
    icon: "💎",
    color: "#7C3AED",
    threshold: 50,
    category: "workouts",
  },
  WORKOUTS_100: {
    id: "workouts_100",
    title: "Атлет",
    description: "Завершите 100 тренировок",
    icon: "🏆",
    color: "#6D28D9",
    threshold: 100,
    category: "workouts",
  },
};

// Получить все достижения пользователя
export const getUserAchievements = async () => {
  try {
    const data = await AsyncStorage.getItem("userAchievements");
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error loading achievements:", e);
    return {};
  }
};

// Сохранить достижения
export const saveUserAchievements = async (achievements) => {
  try {
    await AsyncStorage.setItem("userAchievements", JSON.stringify(achievements));
  } catch (e) {
    console.error("Error saving achievements:", e);
  }
};

// Разблокировать достижение
export const unlockAchievement = async (achievementId) => {
  const achievements = await getUserAchievements();
  if (!achievements[achievementId]) {
    achievements[achievementId] = {
      unlockedAt: new Date().toISOString(),
      seen: false,
    };
    await saveUserAchievements(achievements);
    return true; // Новое достижение
  }
  return false; // Уже разблокировано
};

// Отметить достижение как просмотренное
export const markAchievementAsSeen = async (achievementId) => {
  const achievements = await getUserAchievements();
  if (achievements[achievementId]) {
    achievements[achievementId].seen = true;
    await saveUserAchievements(achievements);
  }
};

// Получить статистику для отслеживания
export const getAchievementStats = async () => {
  try {
    const stats = await AsyncStorage.getItem("achievementStats");
    return stats
      ? JSON.parse(stats)
      : {
          currentStreak: 0,
          lastActiveDate: null,
          totalWaterLiters: 0,
          totalCaloriesBurned: 0,
          weeklyCaloriesBurned: 0,
          weekStartDate: null,
          totalWorkouts: 0,
        };
  } catch (e) {
    console.error("Error loading stats:", e);
    return {
      currentStreak: 0,
      lastActiveDate: null,
      totalWaterLiters: 0,
      totalCaloriesBurned: 0,
      weeklyCaloriesBurned: 0,
      weekStartDate: null,
      totalWorkouts: 0,
    };
  }
};

// Сохранить статистику
export const saveAchievementStats = async (stats) => {
  try {
    await AsyncStorage.setItem("achievementStats", JSON.stringify(stats));
  } catch (e) {
    console.error("Error saving stats:", e);
  }
};

// Инициализация приветственных достижений (при первом запуске)
export const initializeWelcomeAchievements = async () => {
  const userAchievements = await getUserAchievements();
  
  // Если уже есть достижения, не инициализируем
  if (Object.keys(userAchievements).length > 0) {
    return [];
  }

  // Разблокировать приветственные достижения
  const welcomeAchievements = [ACHIEVEMENTS.WELCOME, ACHIEVEMENTS.FIRST_STEP];
  const newAchievements = [];

  for (const achievement of welcomeAchievements) {
    const isNew = await unlockAchievement(achievement.id);
    if (isNew) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
};

// Обновить streak (последовательные дни)
export const updateStreak = async () => {
  // Проверить и разблокировать приветственные достижения при первом запуске
  await initializeWelcomeAchievements();

  const stats = await getAchievementStats();
  const today = new Date().toISOString().split("T")[0];
  
  if (stats.lastActiveDate === today) {
    // Уже обновляли сегодня
    return stats.currentStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (stats.lastActiveDate === yesterdayStr) {
    // Продолжаем streak
    stats.currentStreak += 1;
  } else if (!stats.lastActiveDate) {
    // Первый день
    stats.currentStreak = 1;
  } else {
    // Прервали streak
    stats.currentStreak = 1;
  }

  stats.lastActiveDate = today;
  await saveAchievementStats(stats);

  // Проверка достижений за streak
  await checkStreakAchievements(stats.currentStreak);

  return stats.currentStreak;
};

// Проверка достижений за streak
const checkStreakAchievements = async (streak) => {
  const achievements = [
    ACHIEVEMENTS.STREAK_7,
    ACHIEVEMENTS.STREAK_30,
    ACHIEVEMENTS.STREAK_100,
  ];

  const newAchievements = [];
  for (const achievement of achievements) {
    if (streak >= achievement.threshold) {
      const isNew = await unlockAchievement(achievement.id);
      if (isNew) {
        newAchievements.push(achievement);
      }
    }
  }

  return newAchievements;
};

// Добавить воду и проверить достижения
export const addWaterAndCheckAchievements = async (liters) => {
  const stats = await getAchievementStats();
  stats.totalWaterLiters += liters;
  await saveAchievementStats(stats);

  // Проверка достижений за воду
  const achievements = [
    ACHIEVEMENTS.WATER_100L,
    ACHIEVEMENTS.WATER_500L,
    ACHIEVEMENTS.WATER_1000L,
  ];

  const newAchievements = [];
  for (const achievement of achievements) {
    if (stats.totalWaterLiters >= achievement.threshold) {
      const isNew = await unlockAchievement(achievement.id);
      if (isNew) {
        newAchievements.push(achievement);
      }
    }
  }

  return newAchievements;
};

// Добавить сожженные калории и проверить достижения
export const addCaloriesAndCheckAchievements = async (calories) => {
  const stats = await getAchievementStats();
  stats.totalCaloriesBurned += calories;

  // Проверка недели
  const today = new Date();
  const weekStart = stats.weekStartDate ? new Date(stats.weekStartDate) : null;
  
  if (!weekStart || today - weekStart > 7 * 24 * 60 * 60 * 1000) {
    // Новая неделя
    stats.weeklyCaloriesBurned = calories;
    stats.weekStartDate = today.toISOString();
  } else {
    stats.weeklyCaloriesBurned += calories;
  }

  await saveAchievementStats(stats);

  // Проверка достижений
  const weeklyAchievements = [
    ACHIEVEMENTS.CALORIES_1000,
    ACHIEVEMENTS.CALORIES_3000,
    ACHIEVEMENTS.CALORIES_5000,
  ];

  const totalAchievements = [
    ACHIEVEMENTS.CALORIES_TOTAL_10K,
    ACHIEVEMENTS.CALORIES_TOTAL_50K,
  ];

  const newAchievements = [];

  for (const achievement of weeklyAchievements) {
    if (stats.weeklyCaloriesBurned >= achievement.threshold) {
      const isNew = await unlockAchievement(achievement.id);
      if (isNew) {
        newAchievements.push(achievement);
      }
    }
  }

  for (const achievement of totalAchievements) {
    if (stats.totalCaloriesBurned >= achievement.threshold) {
      const isNew = await unlockAchievement(achievement.id);
      if (isNew) {
        newAchievements.push(achievement);
      }
    }
  }

  return newAchievements;
};

// Добавить тренировку и проверить достижения
export const addWorkoutAndCheckAchievements = async () => {
  const stats = await getAchievementStats();
  stats.totalWorkouts += 1;
  await saveAchievementStats(stats);

  // Проверка достижений за тренировки
  const achievements = [
    ACHIEVEMENTS.WORKOUTS_10,
    ACHIEVEMENTS.WORKOUTS_50,
    ACHIEVEMENTS.WORKOUTS_100,
  ];

  const newAchievements = [];
  for (const achievement of achievements) {
    if (stats.totalWorkouts >= achievement.threshold) {
      const isNew = await unlockAchievement(achievement.id);
      if (isNew) {
        newAchievements.push(achievement);
      }
    }
  }

  return newAchievements;
};

// Получить прогресс для конкретного достижения
export const getAchievementProgress = async (achievement) => {
  const stats = await getAchievementStats();
  const userAchievements = await getUserAchievements();

  const isUnlocked = !!userAchievements[achievement.id];

  let current = 0;
  switch (achievement.category) {
    case "streak":
      current = stats.currentStreak;
      break;
    case "water":
      current = stats.totalWaterLiters;
      break;
    case "calories_weekly":
      current = stats.weeklyCaloriesBurned;
      break;
    case "calories_total":
      current = stats.totalCaloriesBurned;
      break;
    case "workouts":
      current = stats.totalWorkouts;
      break;
    default:
      current = 0;
  }

  return {
    isUnlocked,
    current,
    threshold: achievement.threshold,
    progress: Math.min(100, (current / achievement.threshold) * 100),
  };
};

// Получить все непросмотренные достижения
export const getUnseenAchievements = async () => {
  const userAchievements = await getUserAchievements();
  const unseenIds = Object.keys(userAchievements).filter(
    (id) => !userAchievements[id].seen
  );

  return unseenIds.map((id) => {
    const achievement = Object.values(ACHIEVEMENTS).find((a) => a.id === id);
    return achievement;
  }).filter(Boolean);
};

// Получить статистику для отображения
export const getAchievementsOverview = async () => {
  const userAchievements = await getUserAchievements();
  const stats = await getAchievementStats();
  
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const unlockedCount = Object.keys(userAchievements).length;
  const unseenCount = Object.keys(userAchievements).filter(
    (id) => !userAchievements[id].seen
  ).length;

  return {
    totalAchievements,
    unlockedCount,
    unseenCount,
    currentStreak: stats.currentStreak,
    totalWaterLiters: stats.totalWaterLiters,
    totalCaloriesBurned: stats.totalCaloriesBurned,
    weeklyCaloriesBurned: stats.weeklyCaloriesBurned,
    totalWorkouts: stats.totalWorkouts,
  };
};

// ⚡ ФУНКЦИИ ДЛЯ ТЕСТИРОВАНИЯ ⚡

// Разблокировать тестовые достижения для демонстрации
export const unlockTestAchievements = async () => {
  const testAchievements = [
    ACHIEVEMENTS.WELCOME,
    ACHIEVEMENTS.FIRST_STEP,
    ACHIEVEMENTS.STREAK_7,
    ACHIEVEMENTS.WATER_100L,
    ACHIEVEMENTS.CALORIES_1000,
    ACHIEVEMENTS.WORKOUTS_10,
  ];

  const newAchievements = [];
  for (const achievement of testAchievements) {
    const isNew = await unlockAchievement(achievement.id);
    if (isNew) {
      newAchievements.push(achievement);
    }
  }

  // Обновить статистику для соответствия
  const stats = await getAchievementStats();
  stats.currentStreak = 7;
  stats.totalWaterLiters = 100;
  stats.totalCaloriesBurned = 1000;
  stats.weeklyCaloriesBurned = 1000;
  stats.totalWorkouts = 10;
  await saveAchievementStats(stats);

  return newAchievements;
};

// Сбросить все достижения (для тестирования)
export const resetAllAchievements = async () => {
  try {
    await AsyncStorage.removeItem("userAchievements");
    await AsyncStorage.removeItem("achievementStats");
    return true;
  } catch (e) {
    console.error("Error resetting achievements:", e);
    return false;
  }
};

// Разблокировать ВСЕ достижения (для демо)
export const unlockAllAchievements = async () => {
  const allAchievements = Object.values(ACHIEVEMENTS);
  
  for (const achievement of allAchievements) {
    await unlockAchievement(achievement.id);
  }

  // Обновить статистику на максимум
  const stats = await getAchievementStats();
  stats.currentStreak = 100;
  stats.totalWaterLiters = 1000;
  stats.totalCaloriesBurned = 50000;
  stats.weeklyCaloriesBurned = 5000;
  stats.totalWorkouts = 100;
  await saveAchievementStats(stats);

  return allAchievements;
};

