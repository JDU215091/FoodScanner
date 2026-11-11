// ProductScanInfo.js - Детальная информация о продукте
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Package, AlertTriangle, AlertCircle, Info } from 'lucide-react-native';

export default function ProductScanInfo({ route }) {
  const navigation = useNavigation();
  const { productData, barcode, allergenCheckResult } = route.params;

  if (!productData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Данные о продукте не найдены</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header с кнопкой назад */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#0B1220" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Информация о продукте</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Метка источника */}
        <View style={styles.sourceTag}>
          <Text style={styles.sourceTagText}>
            {productData._source === 'local' ? '📦 Локальная база' : '🌍 Open Food Facts'}
          </Text>
        </View>

        {/* Allergy Warning Section */}
        {allergenCheckResult && (
          <>
            {allergenCheckResult.hasAllergen && (
              <View style={styles.allergyWarningDanger}>
                <View style={styles.allergyWarningHeader}>
                  <AlertTriangle size={24} color="#EF4444" />
                  <Text style={styles.allergyWarningTitleDanger}>
                    ⚠️ Обнаружен аллерген!
                  </Text>
                </View>
                <Text style={styles.allergyWarningText}>
                  Этот продукт содержит ингредиенты, на которые у вас аллергия:
                </Text>
                {allergenCheckResult.detectedAllergens.map((detection, index) => (
                  <View key={index} style={styles.allergenDetectionItem}>
                    <Text style={styles.allergenDetectionIcon}>
                      {detection.allergen.icon}
                    </Text>
                    <View style={styles.allergenDetectionText}>
                      <Text style={styles.allergenDetectionName}>
                        {detection.allergen.name}
                      </Text>
                      {detection.matchedTerms && detection.matchedTerms.length > 0 && (
                        <Text style={styles.allergenDetectionMatched}>
                          Найдено: {detection.matchedTerms.slice(0, 3).join(', ')}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
                <Text style={styles.allergyWarningFooter}>
                  Не употребляйте этот продукт!
                </Text>
              </View>
            )}

            {!allergenCheckResult.hasAllergen && allergenCheckResult.warnings.length > 0 && (
              <View style={styles.allergyWarningCaution}>
                <View style={styles.allergyWarningHeader}>
                  <AlertCircle size={24} color="#F59E0B" />
                  <Text style={styles.allergyWarningTitleCaution}>
                    Недостаточно данных
                  </Text>
                </View>
                <Text style={styles.allergyWarningText}>
                  {allergenCheckResult.warnings[0].message}
                </Text>
                <Text style={styles.allergyWarningFooter}>
                  Проверьте состав на упаковке перед употреблением.
                </Text>
              </View>
            )}

            {!allergenCheckResult.hasAllergen && allergenCheckResult.warnings.length === 0 && (
              <View style={styles.allergyWarningSafe}>
                <View style={styles.allergyWarningHeader}>
                  <Info size={24} color="#10B981" />
                  <Text style={styles.allergyWarningTitleSafe}>
                    ✓ Аллергены не обнаружены
                  </Text>
                </View>
                <Text style={styles.allergyWarningTextSafe}>
                  По имеющимся данным, этот продукт не содержит аллергенов из вашего списка.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Изображение продукта */}
        {productData.image_url ? (
          <Image 
            source={{ uri: productData.image_url }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Package size={64} color="#CBD5E1" />
            <Text style={styles.noImageText}>Нет изображения</Text>
          </View>
        )}

        {/* Название продукта */}
        <View style={styles.header}>
          <Text style={styles.productName}>
            {productData.product_name || 'Без названия'}
          </Text>
          {barcode && (
            <Text style={styles.barcode}>Штрихкод: {barcode}</Text>
          )}
          {productData.brands && (
            <Text style={styles.brand}>Бренд: {productData.brands}</Text>
          )}
          {productData.quantity && (
            <Text style={styles.quantity}>Объем: {productData.quantity}</Text>
          )}
        </View>

        {/* Ингредиенты */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Ингредиенты</Text>
          <Text style={styles.ingredientsText}>
            {productData.ingredients_text || 'Нет данных об ингредиентах'}
          </Text>
        </View>

        {/* Пищевая ценность */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍎 Пищевая ценность (на 100 г)</Text>
          
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {productData.nutriments?.energy_kcal || 'Н/Д'}
              </Text>
              <Text style={styles.nutritionLabel}>Калории (ккал)</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {productData.nutriments?.proteins || 'Н/Д'}
              </Text>
              <Text style={styles.nutritionLabel}>Белки (г)</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {productData.nutriments?.carbohydrates || 'Н/Д'}
              </Text>
              <Text style={styles.nutritionLabel}>Углеводы (г)</Text>
            </View>
            
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {productData.nutriments?.fat || 'Н/Д'}
              </Text>
              <Text style={styles.nutritionLabel}>Жиры (г)</Text>
            </View>
          </View>
        </View>

        {/* Дополнительная информация */}
        {(productData.nutriments?.sugars || productData.nutriments?.fiber || productData.nutriments?.salt) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Дополнительно (на 100 г)</Text>
            
            {productData.nutriments.sugars && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Сахара:</Text>
                <Text style={styles.infoValue}>{productData.nutriments.sugars} г</Text>
              </View>
            )}
            
            {productData.nutriments.fiber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Клетчатка:</Text>
                <Text style={styles.infoValue}>{productData.nutriments.fiber} г</Text>
              </View>
            )}
            
            {productData.nutriments.salt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Соль:</Text>
                <Text style={styles.infoValue}>{productData.nutriments.salt} г</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EC',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F6F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1220',
  },
  scrollView: {
    flex: 1,
  },
  sourceTag: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D9E2FF',
  },
  sourceTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B7CFF',
  },
  productImage: {
    width: '100%',
    height: 250,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  noImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noImageText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B1220',
    marginBottom: 12,
    textAlign: 'center',
  },
  barcode: {
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 6,
  },
  brand: {
    fontSize: 15,
    color: '#5B7CFF',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 6,
  },
  quantity: {
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B1220',
    marginBottom: 12,
  },
  ingredientsText: {
    fontSize: 15,
    color: '#667085',
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5B7CFF',
    marginBottom: 6,
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  infoLabel: {
    fontSize: 15,
    color: '#667085',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B1220',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 40,
  },
  // Allergy Warning Styles
  allergyWarningDanger: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  allergyWarningCaution: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFE082',
  },
  allergyWarningSafe: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  allergyWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  allergyWarningTitleDanger: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
    marginLeft: 12,
  },
  allergyWarningTitleCaution: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 12,
  },
  allergyWarningTitleSafe: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
    marginLeft: 12,
  },
  allergyWarningText: {
    fontSize: 15,
    color: '#7C2D12',
    lineHeight: 22,
    marginBottom: 12,
  },
  allergyWarningTextSafe: {
    fontSize: 15,
    color: '#065F46',
    lineHeight: 22,
  },
  allergyWarningFooter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 8,
  },
  allergenDetectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  allergenDetectionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  allergenDetectionText: {
    flex: 1,
  },
  allergenDetectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  allergenDetectionMatched: {
    fontSize: 13,
    color: '#7C2D12',
  },
});