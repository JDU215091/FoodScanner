// components/AllergyQuestionnaireModal.js - Модальное окно с опросом об аллергии для новых пользователей
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Check, X, AlertCircle } from 'lucide-react-native';
import { 
  getAllAllergens, 
  saveUserAllergens, 
  markAllergyQuestionnaireCompleted 
} from '../utils/allergenUtils';

export default function AllergyQuestionnaireModal({ 
  visible, 
  userEmail, 
  onComplete 
}) {
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleAllergen = (allergenId) => {
    setSelectedAllergens((prev) => {
      if (prev.includes(allergenId)) {
        return prev.filter((id) => id !== allergenId);
      } else {
        return [...prev, allergenId];
      }
    });
  };

  const handleSkip = async () => {
    Alert.alert(
      'Пропустить настройку?',
      'Вы можете настроить аллергены позже в профиле.',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Пропустить',
          onPress: async () => {
            // Отмечаем опрос как пройденный, даже если пропустили
            if (userEmail) {
              await markAllergyQuestionnaireCompleted(userEmail);
            }
            onComplete();
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!userEmail) {
        Alert.alert('Ошибка', 'Не удалось определить пользователя');
        return;
      }

      // Сохраняем выбранные аллергены (даже если пустой список)
      const result = await saveUserAllergens(userEmail, selectedAllergens);
      
      if (result.success) {
        // Отмечаем, что опрос пройден
        await markAllergyQuestionnaireCompleted(userEmail);
        
        if (selectedAllergens.length > 0) {
          Alert.alert(
            'Готово! ✅',
            `Сохранено ${selectedAllergens.length} ${
              selectedAllergens.length === 1 ? 'аллерген' : 
              selectedAllergens.length < 5 ? 'аллергена' : 'аллергенов'
            }.\n\nТеперь при сканировании продуктов вы будете получать предупреждения о выбранных аллергенах.`,
            [
              {
                text: 'Понятно',
                onPress: () => onComplete(),
              },
            ]
          );
        } else {
          Alert.alert(
            'Настройка завершена',
            'Вы не выбрали аллергены. При необходимости вы можете настроить их позже в разделе Профиль → Настройки аллергии.',
            [
              {
                text: 'OK',
                onPress: () => onComplete(),
              },
            ]
          );
        }
      } else {
        Alert.alert('Ошибка', 'Не удалось сохранить настройки. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Error saving allergens:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const allergens = getAllAllergens();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Добро пожаловать! 👋</Text>
              <Text style={styles.subtitle}>
                Есть ли у вас пищевая аллергия?
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleSkip}
            >
              <X size={24} color="#667085" />
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <AlertCircle size={20} color="#5B7CFF" />
            <Text style={styles.infoText}>
              Выберите продукты, на которые у вас аллергия. Мы будем 
              предупреждать вас при сканировании таких продуктов.
            </Text>
          </View>

          {/* Allergen List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>
              Выберите аллергены {selectedAllergens.length > 0 ? `(${selectedAllergens.length})` : ''}
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

            {/* Info about "None" option */}
            <View style={styles.noneInfoCard}>
              <Text style={styles.noneInfoText}>
                ℹ️ Если у вас нет аллергии, просто не выбирайте аллергены 
                и нажмите "Продолжить"
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={saving}
            >
              <Text style={styles.skipButtonText}>Пропустить</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Продолжить</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1220',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#667085',
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 16,
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
  noneInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  noneInfoText: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 20,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4E7EC',
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skipButtonText: {
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
