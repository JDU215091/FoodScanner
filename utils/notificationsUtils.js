// utils/notificationsUtils.js — Система уведомлений и напоминаний
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Конфигурация обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Мотивационные цитаты
const MOTIVATIONAL_QUOTES = [
  "💪 Каждый день - новая возможность стать лучше!",
  "🔥 Ты сильнее, чем думаешь!",
  "⚡ Маленькие шаги ведут к большим результатам!",
  "🎯 Твоя цель ближе, чем кажется!",
  "💎 Постоянство - ключ к успеху!",
  "🚀 Верь в себя и все получится!",
  "✨ Сегодня отличный день для прогресса!",
  "🏆 Чемпионы не рождаются, они создаются!",
  "💪 Твое тело может все, убеди свой разум!",
  "🌟 Ты уже на пути к своей мечте!",
];

// Получить настройки уведомлений
export const getNotificationSettings = async () => {
  try {
    const data = await AsyncStorage.getItem("notificationSettings");
    return data
      ? JSON.parse(data)
      : {
          waterReminders: true,
          waterInterval: 2, // часы
          breakfastTime: "08:00",
          lunchTime: "13:00",
          dinnerTime: "19:00",
          mealReminders: true,
          workoutReminders: true,
          workoutTime: "18:00",
          motivationalQuotes: true,
          motivationalTime: "09:00",
        };
  } catch (e) {
    console.error("Error loading notification settings:", e);
    return {
      waterReminders: true,
      waterInterval: 2,
      breakfastTime: "08:00",
      lunchTime: "13:00",
      dinnerTime: "19:00",
      mealReminders: true,
      workoutReminders: true,
      workoutTime: "18:00",
      motivationalQuotes: true,
      motivationalTime: "09:00",
    };
  }
};

// Сохранить настройки уведомлений
export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem("notificationSettings", JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving notification settings:", e);
  }
};

// Запросить разрешения на уведомления
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return false;
    }

    // Для Android: создать канал уведомлений
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#5B7CFF",
      });
    }

    return true;
  } catch (e) {
    console.error("Error requesting notification permissions:", e);
    return false;
  }
};

// Отменить все уведомления
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.error("Error cancelling notifications:", e);
  }
};

// Парсинг времени "HH:MM" в часы и минуты
const parseTime = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
};

// Получить следующее время для уведомления
const getNextTriggerTime = (hours, minutes) => {
  const now = new Date();
  const trigger = new Date();
  trigger.setHours(hours, minutes, 0, 0);

  // Если время уже прошло сегодня, планируем на завтра
  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }

  return trigger;
};

// Запланировать напоминание о воде (каждые N часов)
export const scheduleWaterReminders = async (intervalHours = 2) => {
  try {
    // Отменить старые напоминания о воде
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === "water") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Планируем напоминания с 8:00 до 22:00
    const startHour = 8;
    const endHour = 22;
    const notificationTimes = [];

    for (let hour = startHour; hour <= endHour; hour += intervalHours) {
      notificationTimes.push(hour);
    }

    for (const hour of notificationTimes) {
      const trigger = getNextTriggerTime(hour, 0);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Время пить воду!",
          body: "Не забудь выпить стакан воды для поддержания здоровья",
          sound: true,
          data: { type: "water" },
        },
        trigger: {
          hour: hour,
          minute: 0,
          repeats: true,
        },
      });
    }

    console.log(`Scheduled ${notificationTimes.length} water reminders`);
  } catch (e) {
    console.error("Error scheduling water reminders:", e);
  }
};

// Запланировать напоминания о еде
export const scheduleMealReminders = async (breakfastTime, lunchTime, dinnerTime) => {
  try {
    // Отменить старые напоминания о еде
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === "meal") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    const meals = [
      { time: breakfastTime, title: "🍳 Завтрак", body: "Время позавтракать! Не пропусти первый прием пищи" },
      { time: lunchTime, title: "🥗 Обед", body: "Время обеда! Заполни свой дневник питания" },
      { time: dinnerTime, title: "🍽️ Ужин", body: "Время ужина! Не забудь записать калории" },
    ];

    for (const meal of meals) {
      const { hours, minutes } = parseTime(meal.time);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: meal.title,
          body: meal.body,
          sound: true,
          data: { type: "meal" },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    }

    console.log("Scheduled meal reminders");
  } catch (e) {
    console.error("Error scheduling meal reminders:", e);
  }
};

// Запланировать напоминание о тренировке
export const scheduleWorkoutReminder = async (workoutTime) => {
  try {
    // Отменить старые напоминания о тренировке
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === "workout") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    const { hours, minutes } = parseTime(workoutTime);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💪 Время тренировки!",
        body: "Твое тело готово к активности. Пора начинать!",
        sound: true,
        data: { type: "workout" },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    console.log("Scheduled workout reminder");
  } catch (e) {
    console.error("Error scheduling workout reminder:", e);
  }
};

// Запланировать мотивационную цитату
export const scheduleMotivationalQuote = async (time) => {
  try {
    // Отменить старые мотивационные уведомления
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === "motivation") {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    const { hours, minutes } = parseTime(time);
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✨ Мотивация дня",
        body: randomQuote,
        sound: true,
        data: { type: "motivation" },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    console.log("Scheduled motivational quote");
  } catch (e) {
    console.error("Error scheduling motivational quote:", e);
  }
};

// Настроить все уведомления на основе сохраненных настроек
export const setupAllNotifications = async () => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("Notification permissions not granted");
      return false;
    }

    const settings = await getNotificationSettings();

    // Отменить все старые уведомления
    await cancelAllNotifications();

    // Планируем новые на основе настроек
    if (settings.waterReminders) {
      await scheduleWaterReminders(settings.waterInterval);
    }

    if (settings.mealReminders) {
      await scheduleMealReminders(
        settings.breakfastTime,
        settings.lunchTime,
        settings.dinnerTime
      );
    }

    if (settings.workoutReminders) {
      await scheduleWorkoutReminder(settings.workoutTime);
    }

    if (settings.motivationalQuotes) {
      await scheduleMotivationalQuote(settings.motivationalTime);
    }

    console.log("All notifications set up successfully");
    return true;
  } catch (e) {
    console.error("Error setting up notifications:", e);
    return false;
  }
};

// Отправить тестовое уведомление
export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎉 Тестовое уведомление",
        body: "Уведомления работают отлично!",
        sound: true,
        data: { type: "test" },
      },
      trigger: {
        seconds: 2,
      },
    });
  } catch (e) {
    console.error("Error sending test notification:", e);
  }
};

// Получить все запланированные уведомления (для отладки)
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (e) {
    console.error("Error getting scheduled notifications:", e);
    return [];
  }
};

// Отменить уведомления определенного типа
export const cancelNotificationsByType = async (type) => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === type) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (e) {
    console.error(`Error cancelling ${type} notifications:`, e);
  }
};

// Отправить уведомление о достижении
export const sendAchievementNotification = async (achievement) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🏆 Достижение разблокировано!`,
        body: `${achievement.icon} ${achievement.title}: ${achievement.description}`,
        sound: true,
        data: { type: "achievement", achievementId: achievement.id },
      },
      trigger: {
        seconds: 1,
      },
    });
  } catch (e) {
    console.error("Error sending achievement notification:", e);
  }
};

// Отправить напоминание о streak (если пользователь не использовал приложение)
export const checkAndSendStreakReminder = async () => {
  try {
    const lastActiveDate = await AsyncStorage.getItem("lastActiveDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastActiveDate !== today) {
      // Пользователь еще не был активен сегодня
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔥 Не теряй свою серию!",
          body: "Открой приложение, чтобы продолжить streak",
          sound: true,
          data: { type: "streak_reminder" },
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: false,
        },
      });
    }
  } catch (e) {
    console.error("Error checking streak:", e);
  }
};

// Обработчик ответа на уведомление
export const setupNotificationResponseHandler = (navigation) => {
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    
    // Навигация в зависимости от типа уведомления
    switch (data?.type) {
      case "water":
        navigation.navigate("Home");
        break;
      case "meal":
        navigation.navigate("AddFood");
        break;
      case "workout":
        navigation.navigate("Home");
        break;
      case "achievement":
        navigation.navigate("Achievements");
        break;
      default:
        navigation.navigate("Home");
    }
  });
};

