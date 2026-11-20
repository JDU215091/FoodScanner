// utils/achievementToastState.js - Глобальное состояние для toast уведомлений о достижениях
// Вынесено из App.js для избежания циклических зависимостей

export const achievementToastState = {
  achievement: null,
  visible: false,
  listeners: [],
  
  show: (achievement) => {
    achievementToastState.achievement = achievement;
    achievementToastState.visible = true;
    achievementToastState.listeners.forEach((listener) => listener());
  },
  
  hide: () => {
    achievementToastState.visible = false;
    achievementToastState.listeners.forEach((listener) => listener());
  },
  
  subscribe: (listener) => {
    achievementToastState.listeners.push(listener);
    return () => {
      achievementToastState.listeners = achievementToastState.listeners.filter(
        (l) => l !== listener
      );
    };
  },
};
