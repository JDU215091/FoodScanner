// components/AchievementToast.js — Красивое всплывающее уведомление о достижении
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Trophy } from "lucide-react-native";

const { width } = Dimensions.get("window");

const C = {
  card: "#FFFFFF",
  border: "#E4E7EC",
  text: "#0B1220",
  sub: "#667085",
  gold: "#FFD700",
};

export default function AchievementToast({ achievement, visible, onHide }) {
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Показать уведомление
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 60,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Автоматически скрыть через 4 секунды
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!achievement) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.toast}>
        <View style={styles.iconContainer}>
          <Trophy size={24} color={C.gold} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>🎉 Достижение разблокировано!</Text>
          <Text style={styles.achievementTitle}>
            {achievement.icon} {achievement.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {achievement.description}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: C.gold,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: C.sub,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: C.sub,
    lineHeight: 18,
  },
});

