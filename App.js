// App.js — flat capsule tabbar with centered inline FAB (Scanner). Auth/logic preserved.
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { setupAllNotifications } from "./utils/notificationsUtils";
import AchievementToast from "./components/AchievementToast";
import AllergyQuestionnaireModal from "./components/AllergyQuestionnaireModal";
import { hasCompletedAllergyQuestionnaire } from "./utils/allergenUtils";
import { achievementToastState } from "./utils/achievementToastState";

import { Home, Scan, User, Calendar, Search } from "lucide-react-native";

// Screens
import HomeScreen from "./screens/HomeScreen";
import InfoScanner from "./screens/InfoScanner";
import ProfileScreen from "./screens/ProfileScreen";
import CalendarScreen from "./screens/CalendarScreen";
import FoodLogScreen from "./screens/FoodLogScreen";
import AddFoodScreen from "./screens/AddFoodScreen";
import StatsScreen from "./screens/StatsScreen";
import ProductSearch from "./screens/ProductSearch";
import ProductDetail from "./screens/ProductDetail";
import ProductScanInfo from "./screens/ProductScanInfo";
import LoginScreen from "./screens/LoginScreen";
import WorkoutDetailScreen from "./screens/WorkoutDetailScreen";
import AchievementsScreen from "./screens/AchievementsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import AllergySettingsScreen from "./screens/AllergySettingsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const UI = {
  appBg: "#EEF2FF",
  panel: "#FFFFFF",
  border: "#E4E7EC",
  icon: "#6B7380",
  fab: "#5B7CFF",
};

function CustomTabBar({ navigation }) {
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={styles.capsule}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.navBtn}>
          <Home size={22} color={UI.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")} style={styles.navBtn}>
          <Calendar size={22} color={UI.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Scanner")}
          style={styles.fab}
          accessibilityLabel="Открыть сканер"
        >
          <Scan size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Search")} style={styles.navBtn}>
          <Search size={22} color={UI.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.avatarBtn}>
          <User size={18} color="#0B1220" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Scanner" component={InfoScanner} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Search" component={ProductSearch} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="InfoScanner" component={InfoScanner} />
      <Stack.Screen name="FoodLog" component={FoodLogScreen} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="Stats" component={StatsScreen} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={{ headerShown: true, title: "Продукт" }}
      />
      <Stack.Screen
        name="ProductScanInfo"
        component={ProductScanInfo}
        options={{ headerShown: true, title: "Информация о продукте" }}
      />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="AllergySettings"
        component={AllergySettingsScreen}
        options={{ headerShown: true, title: "Настройки аллергии" }}
      />
    </Stack.Navigator>
  );
}

export const navigationRef = React.createRef();

function AppContent() {
  const { isAuthenticated, isAuthLoading, user, isNewUser, markUserAsOnboarded } = useAuth();
  const [toastAchievement, setToastAchievement] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [showAllergyQuestionnaire, setShowAllergyQuestionnaire] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      setupAllNotifications().catch((e) => 
        console.error("Error setting up notifications:", e)
      );
    }
  }, [isAuthenticated]);

  // Показать опрос об аллергии для пользователей, которые его еще не прошли
  useEffect(() => {
    const checkAndShowQuestionnaire = async () => {
      if (isAuthenticated && user?.email) {
        const hasCompleted = await hasCompletedAllergyQuestionnaire(user.email);
        
        if (!hasCompleted) {
          const timer = setTimeout(() => {
            setShowAllergyQuestionnaire(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    };

    checkAndShowQuestionnaire();
  }, [isAuthenticated, user?.email, isNewUser]);

  const handleAllergyQuestionnaireComplete = () => {
    setShowAllergyQuestionnaire(false);
    markUserAsOnboarded();
  };

  useEffect(() => {
    const unsubscribe = achievementToastState.subscribe(() => {
      setToastAchievement(achievementToastState.achievement);
      setToastVisible(achievementToastState.visible);
    });
    return unsubscribe;
  }, []);

  if (isAuthLoading) return null;

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="AppNavigator" component={AppNavigator} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      
      <AchievementToast
        achievement={toastAchievement}
        visible={toastVisible}
        onHide={() => achievementToastState.hide()}
      />

      {isAuthenticated && (
        <AllergyQuestionnaireModal
          visible={showAllergyQuestionnaire}
          userEmail={user?.email}
          onComplete={handleAllergyQuestionnaireComplete}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  capsule: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
    height: 72,
    backgroundColor: UI.panel,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: UI.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: UI.border,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UI.fab,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B7CFF",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
});
