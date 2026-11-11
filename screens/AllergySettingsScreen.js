// screens/AllergySettingsScreen.js - Allergy preferences management screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../auth/AuthProvider';
import {
  getAllAllergens,
  saveUserAllergens,
  loadUserAllergens,
} from '../utils/allergenUtils';

export default function AllergySettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      if (user?.email) {
        const savedAllergens = await loadUserAllergens(user.email);
        setSelectedAllergens(savedAllergens);
      }
    } catch (error) {
      console.error('Error loading allergy preferences:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить настройки аллергии');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (allergenId) => {
    setSelectedAllergens((prev) => {
      if (prev.includes(allergenId)) {
        // Remove allergen
        return prev.filter((id) => id !== allergenId);
      } else {
        // Add allergen
        return [...prev, allergenId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!user?.email) {
        Alert.alert('Ошибка', 'Необходимо войти в систему');
        return;
      }

      const result = await saveUserAllergens(user.email, selectedAllergens);
      
      if (result.success) {
        Alert.alert(
          'Успех',
          'Настройки аллергии сохранены',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Ошибка', 'Не удалось сохранить настройки');
      }
    } catch (error) {
      console.error('Error saving allergy preferences:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Сброс настроек',
      'Вы уверены, что хотите сбросить все выбранные аллергены?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: () => setSelectedAllergens([]),
        },
      ]
    );
  };

  const allergens = getAllAllergens();

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5B7CFF" />
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#EEF2FF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color="#0B1220" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Настройки аллергии</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <AlertCircle size={24} color="#5B7CFF" />
              <Text style={styles.infoText}>
                Выберите продукты, на которые у вас аллергия. Приложение будет
                проверять сканированные продукты и предупреждать о возможном
                наличии аллергенов.
              </Text>
            </View>

            {/* Allergen Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Выберите ваши аллергены ({selectedAllergens.length})
              </Text>

              {allergens.map((allergen) => {
                const isSelected = selectedAllergens.includes(allergen.id);

                return (
                  <TouchableOpacity
                    key={allergen.id}
                    style={[
                      styles.allergenCard,
                      isSelected && styles.allergenCardSelected,
                    ]}
                    onPress={() => toggleAllergen(allergen.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.allergenLeft}>
                      <Text style={styles.allergenIcon}>{allergen.icon}</Text>
                      <View style={styles.allergenTextContainer}>
                        <Text style={styles.allergenName}>{allergen.name}</Text>
                        <Text style={styles.allergenNameEn}>
                          {allergen.nameEn}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && <Check size={18} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Safety Notice */}
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>⚠️ Важное примечание</Text>
              <Text style={styles.warningText}>
                Функция обнаружения аллергенов основана на данных API и не
                может гарантировать 100% точность. Всегда проверяйте состав
                продукта на упаковке и консультируйтесь с врачом при серьезных
                аллергиях.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          {selectedAllergens.length > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              disabled={saving}
            >
              <Text style={styles.resetButtonText}>Сбросить</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              selectedAllergens.length === 0 && { flex: 1 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Check size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EEF2FF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1220',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#667085',
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#D9E2FF',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1220',
    marginBottom: 16,
  },
  allergenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E4E7EC',
  },
  allergenCardSelected: {
    borderColor: '#5B7CFF',
    backgroundColor: '#F8FAFF',
  },
  allergenLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergenIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  allergenTextContainer: {
    flex: 1,
  },
  allergenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B1220',
    marginBottom: 2,
  },
  allergenNameEn: {
    fontSize: 13,
    color: '#667085',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#5B7CFF',
    borderColor: '#5B7CFF',
  },
  warningCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#5B7CFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
