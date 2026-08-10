// screens/NotificationsScreen.js — Экран настроек уведомлений
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Modal,
  Platform,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  Droplet,
  Utensils,
  Dumbbell,
  Sparkles,
  Check,
} from "lucide-react-native";
import {
  getNotificationSettings,
  saveNotificationSettings,
  setupAllNotifications,
  sendTestNotification,
  getScheduledNotifications,
  cancelAllNotifications,
} from "../utils/notificationsUtils";

const C = {
  bg: "#EEF2FF",
  card: "#FFFFFF",
  border: "#E4E7EC",
  text: "#0B1220",
  sub: "#667085",
  primary: "#5B7CFF",
  accent: "#3F8CFF",
  success: "#22C55E",
};

export default function NotificationsScreen({ navigation }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentTimePicker, setCurrentTimePicker] = useState(null);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await getNotificationSettings();
    setSettings(loaded);
  };

  const handleToggle = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveNotificationSettings(updated);
    await setupAllNotifications();
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await saveNotificationSettings(settings);
      const success = await setupAllNotifications();
      if (success) {
        Alert.alert("✅ Сохранено", "Настройки уведомлений обновлены");
      } else {
        Alert.alert(
          "⚠️ Внимание",
          "Разрешите уведомления в настройках телефона для полной функциональности"
        );
      }
    } catch (e) {
      Alert.alert("❌ Ошибка", "Не удалось сохранить настройки");
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
    Alert.alert("🔔 Отправлено", "Тестовое уведомление придет через 2 секунды");
  };

  const openTimePicker = (key, currentValue) => {
    const [hours, minutes] = currentValue.split(":").map(Number);
    setSelectedHour(hours);
    setSelectedMinute(minutes);
    setCurrentTimePicker(key);
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = () => {
    const timeString = `${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`;
    const updated = { ...settings, [currentTimePicker]: timeString };
    setSettings(updated);
    setTimePickerVisible(false);
  };

  const renderTimeButton = (label, value, settingKey) => (
    <View style={styles.timeRow}>
      <Text style={styles.timeLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.timeBtn}
        onPress={() => openTimePicker(settingKey, value)}
      >
        <Text style={styles.timeText}>{value}</Text>
      </TouchableOpacity>
    </View>
  );

  if (!settings) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Уведомления</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Bell size={24} color={C.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoTitle}>Умные напоминания</Text>
              <Text style={styles.infoSub}>
                Настрой персональные уведомления для достижения целей
              </Text>
            </View>
          </View>

          {/* Вода */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Droplet size={20} color={C.accent} />
              <Text style={styles.sectionTitle}>Напоминания о воде</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Включить напоминания</Text>
                  <Text style={styles.settingDesc}>
                    Напоминания каждые {settings.waterInterval} часа с 8:00 до 22:00
                  </Text>
                </View>
                <Switch
                  value={settings.waterReminders}
                  onValueChange={(v) => handleToggle("waterReminders", v)}
                  trackColor={{ false: "#D1D5DB", true: C.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {settings.waterReminders && (
                <View style={styles.intervalPicker}>
                  <Text style={styles.intervalLabel}>Интервал (часы)</Text>
                  <View style={styles.intervalBtns}>
                    {[1, 2, 3, 4].map((interval) => (
                      <TouchableOpacity
                        key={interval}
                        style={[
                          styles.intervalBtn,
                          settings.waterInterval === interval && styles.intervalBtnActive,
                        ]}
                        onPress={() => {
                          const updated = { ...settings, waterInterval: interval };
                          setSettings(updated);
                        }}
                      >
                        <Text
                          style={[
                            styles.intervalBtnText,
                            settings.waterInterval === interval && styles.intervalBtnTextActive,
                          ]}
                        >
                          {interval}ч
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Еда */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Utensils size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Напоминания о еде</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Включить напоминания</Text>
                  <Text style={styles.settingDesc}>Завтрак, обед и ужин</Text>
                </View>
                <Switch
                  value={settings.mealReminders}
                  onValueChange={(v) => handleToggle("mealReminders", v)}
                  trackColor={{ false: "#D1D5DB", true: C.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {settings.mealReminders && (
                <View style={styles.timesContainer}>
                  {renderTimeButton("Завтрак", settings.breakfastTime, "breakfastTime")}
                  {renderTimeButton("Обед", settings.lunchTime, "lunchTime")}
                  {renderTimeButton("Ужин", settings.dinnerTime, "dinnerTime")}
                </View>
              )}
            </View>
          </View>

          {/* Тренировки */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Dumbbell size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Напоминания о тренировке</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Включить напоминания</Text>
                  <Text style={styles.settingDesc}>Ежедневное напоминание</Text>
                </View>
                <Switch
                  value={settings.workoutReminders}
                  onValueChange={(v) => handleToggle("workoutReminders", v)}
                  trackColor={{ false: "#D1D5DB", true: C.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {settings.workoutReminders && (
                <View style={styles.timesContainer}>
                  {renderTimeButton("Время тренировки", settings.workoutTime, "workoutTime")}
                </View>
              )}
            </View>
          </View>

          {/* Мотивация */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Мотивационные цитаты</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>Включить цитаты</Text>
                  <Text style={styles.settingDesc}>Вдохновляющие сообщения каждый день</Text>
                </View>
                <Switch
                  value={settings.motivationalQuotes}
                  onValueChange={(v) => handleToggle("motivationalQuotes", v)}
                  trackColor={{ false: "#D1D5DB", true: C.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {settings.motivationalQuotes && (
                <View style={styles.timesContainer}>
                  {renderTimeButton("Время отправки", settings.motivationalTime, "motivationalTime")}
                </View>
              )}
            </View>
          </View>

          {/* Кнопки действий */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
              onPress={handleSaveAll}
              disabled={saving}
            >
              <Check size={20} color="#FFF" />
              <Text style={styles.primaryBtnText}>
                {saving ? "Сохранение..." : "Применить настройки"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleTestNotification}>
              <Bell size={18} color={C.primary} />
              <Text style={styles.secondaryBtnText}>Отправить тест</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Time Picker Modal */}
        <Modal
          animationType="fade"
          transparent
          visible={timePickerVisible}
          onRequestClose={() => setTimePickerVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Выбери время</Text>

              <View style={styles.timePickerContainer}>
                {/* Hours */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Часы</Text>
                  <ScrollView
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.pickerItem,
                          selectedHour === hour && styles.pickerItemActive,
                        ]}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedHour === hour && styles.pickerItemTextActive,
                          ]}
                        >
                          {String(hour).padStart(2, "0")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                {/* Minutes */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Минуты</Text>
                  <ScrollView
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.pickerItem,
                          selectedMinute === minute && styles.pickerItemActive,
                        ]}
                        onPress={() => setSelectedMinute(minute)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedMinute === minute && styles.pickerItemTextActive,
                          ]}
                        >
                          {String(minute).padStart(2, "0")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => setTimePickerVisible(false)}
                >
                  <Text style={styles.modalBtnTextCancel}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={handleTimeConfirm}
                >
                  <Text style={styles.modalBtnTextConfirm}>Готово</Text>
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
  container: { flex: 1, backgroundColor: C.bg },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  loadingText: { fontSize: 16, color: C.sub, textAlign: "center", marginTop: 40 },

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

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 4 },
  infoSub: { fontSize: 13, color: C.sub, lineHeight: 18 },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.text },

  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLabel: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 4 },
  settingDesc: { fontSize: 13, color: C.sub },

  intervalPicker: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  intervalLabel: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 10 },
  intervalBtns: { flexDirection: "row", gap: 10 },
  intervalBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  intervalBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  intervalBtnText: { fontSize: 14, fontWeight: "700", color: C.text },
  intervalBtnTextActive: { color: "#FFF" },

  timesContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeLabel: { fontSize: 14, fontWeight: "600", color: C.text },
  timeBtn: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  timeText: { fontSize: 16, fontWeight: "700", color: C.primary },

  actionsContainer: { paddingHorizontal: 16, marginTop: 10, gap: 12 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderRadius: 16,
    backgroundColor: C.primary,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "800", color: "#FFF" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "700", color: C.primary },

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
    padding: 20,
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
    textAlign: "center",
    marginBottom: 20,
  },

  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pickerColumn: { flex: 1, alignItems: "center" },
  pickerLabel: { fontSize: 13, fontWeight: "700", color: C.sub, marginBottom: 10 },
  pickerScroll: { maxHeight: 180, width: "100%" },
  pickerItem: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 2,
  },
  pickerItemActive: { backgroundColor: C.primary },
  pickerItemText: { fontSize: 18, fontWeight: "700", color: C.sub },
  pickerItemTextActive: { color: "#FFF" },
  timeSeparator: { fontSize: 24, fontWeight: "700", color: C.text, marginHorizontal: 10 },

  modalActions: { flexDirection: "row", gap: 10 },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalBtnPrimary: { backgroundColor: C.primary, borderColor: C.primary },
  modalBtnTextCancel: { fontSize: 15, fontWeight: "700", color: C.sub },
  modalBtnTextConfirm: { fontSize: 15, fontWeight: "800", color: "#FFF" },
});

