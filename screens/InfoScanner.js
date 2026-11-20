import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ScanLine } from 'lucide-react-native';
import axios from 'axios';
import { products } from '../data/products';
import { useAuth } from '../auth/AuthProvider';
import { loadUserAllergens, performAllergenCheck } from '../utils/allergenUtils';

export default function InfoScanner() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      return () => {};
    }, [])
  );

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Загрузка камеры...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#5B7CFF" />
          <Text style={styles.permissionTitle}>Доступ к камере</Text>
          <Text style={styles.permissionText}>
            Для сканирования штрих-кодов необходим доступ к камере
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Разрешить доступ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fetchProductInfo = async (barcode) => {
    setLoading(true);
    try {
      const localProduct = products.find(p => p.barcode === barcode);
      
      if (localProduct) {
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
          _source: 'local'
        };
        
        const allergenCheckResult = await checkProductForAllergens(productData);
        
        setLoading(false);
        
        navigation.navigate('ProductScanInfo', { 
          productData: productData,
          barcode: barcode,
          allergenCheckResult: allergenCheckResult
        });
        
        return;
      }
      
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid API response format');
      }
      
      if (response.data.status === 1) {
        const productData = {
          ...response.data.product,
          barcode: barcode,
          _source: 'api'
        };
        
        const allergenCheckResult = await checkProductForAllergens(productData);
        
        setLoading(false);
        
        navigation.navigate('ProductScanInfo', { 
          productData: productData,
          barcode: barcode,
          allergenCheckResult: allergenCheckResult
        });
      } else {
        console.log('Product not found in database');
        Alert.alert(
          '❌ Продукт не найден',
          `Штрих-код ${barcode} не найден ни в локальной базе, ни в базе Open Food Facts.\n\nМожете добавить этот продукт вручную.`
        );
        setTimeout(() => setScanned(false), 2000);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      
      let errorMessage = 'Не удалось получить данные о продукте.';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Превышено время ожидания. Проверьте подключение к интернету.';
      } else if (error.message.includes('Network Error') || error.message.includes('Network request failed')) {
        errorMessage = 'Нет подключения к интернету.';
      } else if (error.message.includes('Invalid API response')) {
        errorMessage = 'Сервер вернул некорректные данные. Попробуйте позже.';
      } else if (error.response && error.response.status >= 500) {
        errorMessage = 'Сервер временно недоступен. Попробуйте позже.';
      }
      
      Alert.alert(
        'Ошибка',
        errorMessage + '\n\nШтрих-код: ' + barcode
      );
      setTimeout(() => setScanned(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const checkProductForAllergens = async (productData) => {
    try {
      if (!user?.email) return null;

      const userAllergens = await loadUserAllergens(user.email);
      
      if (userAllergens.length === 0) return null;

      const result = performAllergenCheck(productData, userAllergens);
      
      return result;
    } catch (error) {
      console.error('Error checking allergens:', error);
      return null;
    }
  };

  const handleBarcodeScan = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    if (data) {
      if (data.includes('http')) {
        Alert.alert(
          'Обработка фото',
          'Обработка фото пока не реализована. Используйте режим сканера штрих-кодов.'
        );
        setTimeout(() => setScanned(false), 2000);
      } else {
        fetchProductInfo(data);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleBarcodeScan}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <ScanLine size={200} color="#5B7CFF" />
            <Text style={styles.scanText}>
              Наведите камеру на штрих-код
            </Text>
          </View>
        </View>
      </CameraView>

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
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EEF2FF',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0B1220',
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#5B7CFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});