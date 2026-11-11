import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import ProductScanner from './ProductScanner';
import { products } from '../data/products';
import { useAuth } from '../auth/AuthProvider';
import { loadUserAllergens, performAllergenCheck } from '../utils/allergenUtils';

export default function InfoScanner() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchProductInfo = async (barcode) => {
    setLoading(true);
    try {
      // 🔍 ШАГ 1: Проверка локальной базы данных
      console.log('🔍 Проверяю локальную базу для штрих-кода:', barcode);
      const localProduct = products.find(p => p.barcode === barcode);
      
      if (localProduct) {
        // ✅ Продукт найден в локальной базе!
        console.log('✅ Найден в локальной базе:', localProduct.name);
        
        const productData = {
          product_name: localProduct.name,
          barcode: barcode,
          ingredients_text: localProduct.ingredients,
          nutriments: {
            energy_kcal: 'Нет данных',
            proteins: 'Нет данных',
            fat: 'Нет данных',
            carbohydrates: 'Нет данных',
          },
          _source: 'local' // Метка что из локальной базы
        };
        
        // 🔍 Проверка на аллергены
        const allergenCheckResult = await checkProductForAllergens(productData);
        
        setLoading(false);
        
        // 📱 Переход на страницу с деталями
        navigation.navigate('ProductScanInfo', { 
          productData: productData,
          barcode: barcode,
          allergenCheckResult: allergenCheckResult
        });
        
        return; // Останавливаемся, не идем в API
      }
      
      // 🌍 ШАГ 2: Если не нашли локально → запрос к Open Food Facts API
      console.log('⏳ Не найден локально, проверяю Open Food Facts API...');
      
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      
      if (response.data.status === 1) {
        // ✅ Продукт найден в Open Food Facts
        console.log('✅ Найден в Open Food Facts:', response.data.product.product_name);
        
        const productData = {
          ...response.data.product,
          barcode: barcode,
          _source: 'api' // Метка что из API
        };
        
        // 🔍 Проверка на аллергены
        const allergenCheckResult = await checkProductForAllergens(productData);
        
        setLoading(false);
        
        // 📱 Переход на страницу с деталями
        navigation.navigate('ProductScanInfo', { 
          productData: productData,
          barcode: barcode,
          allergenCheckResult: allergenCheckResult
        });
      } else {
        // ❌ Продукт не найден нигде
        console.log('❌ Продукт не найден ни в локальной базе, ни в Open Food Facts');
        setProductInfo(null);
        Alert.alert(
          '❌ Продукт не найден',
          `Штрих-код ${barcode} не найден ни в локальной базе, ни в базе Open Food Facts.\n\nМожете добавить этот продукт вручную.`
        );
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось получить данные о продукте. Проверьте подключение к интернету.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Проверка продукта на аллергены
  const checkProductForAllergens = async (productData) => {
    try {
      if (!user?.email) {
        // Пользователь не вошел в систему
        return null;
      }

      // Загружаем аллергены пользователя
      const userAllergens = await loadUserAllergens(user.email);
      
      if (userAllergens.length === 0) {
        // У пользователя нет настроенных аллергенов
        return null;
      }

      // Выполняем проверку
      const result = performAllergenCheck(productData, userAllergens);
      
      console.log('🔍 Результат проверки аллергенов:', result);
      
      return result;
    } catch (error) {
      console.error('Ошибка при проверке аллергенов:', error);
      return null;
    }
  };

  const handleScan = (data) => {
    if (data.includes('http')) {
      // Если это URI фото, можно отправить на API компьютерного зрения (например, Google Cloud Vision)
      Alert.alert(
        'Обработка фото',
        'Обработка фото пока не реализована. Используйте режим сканера штрих-кодов.'
      );
    } else {
      // Если это штрихкод
      console.log('📱 Отсканирован штрих-код:', data);
      fetchProductInfo(data);
    }
  };

  return (
    <View style={styles.container}>
      <ProductScanner onScan={handleScan} />
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔍 Поиск продукта...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});