import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ScanLine, Camera, Repeat } from "lucide-react-native";

const UI = {
  panel: "rgba(255,255,255,0.92)",
  border: "#E4E7EC",
  text: "#0B1220",
  primary: "#5B7CFF",
};

export default function ProductScanner({ onScan }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [useScanner, setUseScanner] = useState(true);   // true = сканер, false = камера
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Когда экран снова в фокусе — разрешаем новое сканирование
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      return () => {};
    }, [])
  );

  if (!permission) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: "#000" }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerNote}>
          <Text style={styles.note}>Запрос доступа к камере…</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: "#000" }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerNote}>
          <Text style={styles.note}>Нет доступа к камере</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryText}>Разрешить доступ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Сканер ----
  const handleBarCodeScanned = ({ data }) => {
    if (!useScanner || scanned) return;
    setScanned(true);
    // Передаем код в onScan callback (InfoScanner обработает)
    if (onScan) {
      onScan(data);
    } else {
      Alert.alert("Отсканировано", `Штрих-код: ${data}`);
    }
  };

  // ---- Камера (фото) ----
  const takePicture = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      // Передаем URI фото в onScan callback (InfoScanner обработает)
      if (onScan) {
        onScan(photo?.uri);
      } else {
        Alert.alert("Фото сделано", "URI фото передан для обработки");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось сделать фото");
    }
  };

  const toCamera = () => {
    setScanned(false);
    setUseScanner(false);
  };
  const toScanner = () => {
    setScanned(false);
    setUseScanner(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.fill}>
        <CameraView
          ref={cameraRef}
          style={styles.fill}
          facing="back"
          // только в режиме сканера ловим штрихкоды
          onBarcodeScanned={useScanner && !scanned ? handleBarCodeScanned : undefined}
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "code128", "qr"] }}
        >
          {/* подсказка сверху */}
          <View style={styles.topOverlay}>
            <Text style={styles.hint}>
              {useScanner ? "Наведите на штрих-код" : "Режим камеры — сделайте фото"}
            </Text>
          </View>

          {/* прицел — только в режиме сканера */}
          {useScanner && (
            <View style={styles.reticle}>
              <ScanLine size={36} color="#FFFFFF" />
            </View>
          )}

          {/* нижняя панель — только основные действия */}
          <View
            style={[
              styles.bottomPanel,
              { paddingBottom: 10 + insets.bottom, bottom: 12 + insets.bottom },
            ]}
          >
            {useScanner ? (
              // В сканере — одна большая кнопка перейти в камеру
              <TouchableOpacity style={[styles.primaryBtn, { alignSelf: "center", minWidth: 220 }]} onPress={toCamera}>
                <Camera size={18} color="#fff" />
                <Text style={styles.primaryText}>В режим камеры</Text>
              </TouchableOpacity>
            ) : (
              // В камере — большая кнопка Сделать фото + компактный переключатель назад
              <View style={styles.row}>
                <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={takePicture}>
                  <Camera size={18} color="#fff" />
                  <Text style={styles.primaryText}>Сделать фото</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.switchBtn} onPress={toScanner}>
                  <Repeat size={18} color={UI.text} />
                  <Text style={styles.switchText}>В режим сканера</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  fill: { flex: 1 },

  topOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  hint: { color: "#fff", fontWeight: "700" },

  reticle: {
    position: "absolute",
    top: "42%",
    alignSelf: "center",
    width: 160,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  bottomPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    backgroundColor: UI.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 12,
  },

  // большие кнопки
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: UI.primary,
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 999,
    shadowColor: "#5B7CFF",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  primaryText: { color: "#fff", fontWeight: "800" },

  // компактный переключатель назад в сканер (только в режиме камеры)
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  switchBtn: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.border,
    backgroundColor: "#F6F7FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  switchText: { color: UI.text, fontWeight: "700" },

  centerNote: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  note: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
