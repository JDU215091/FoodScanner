// screens/LoginScreen.js — креативный flat-premium дизайн, БЕЗ TypeScript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthProvider";
import { Mail, Lock, Eye, EyeOff, Camera, Droplet, Flame } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth(); // ← объект, не массив

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (!res?.success) {
        Alert.alert("Ошибка", res?.message || "Не удалось войти");
      }
      // переход на Home произойдёт автоматически по isAuthenticated
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const res = await signUp(email, password);
      if (res?.success) {
        Alert.alert("Готово", "Регистрация выполнена");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Ошибка", res?.message || "Не удалось зарегистрироваться");
      }
    } catch (e) {
      Alert.alert("Ошибка", "Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  };

  const renderLogo = () => {
    try {
      return (
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      );
    } catch {
      return <Text style={styles.logoText}>CaloriCam</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Декоративные soft blobs */}
      <View style={styles.blobA} />
      <View style={styles.blobB} />
      <View style={styles.blobC} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.wrap}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.brand}>FoodScanner</Text>
            <Text style={styles.tagline}>Сканируй продукты · Веди рацион · Пей воду</Text>

            {/* <View style={styles.featuresRow}>
              <View style={styles.featureChip}>
                <Camera size={16} color="#5B7CFF" />
                <Text style={styles.featureText}>Сканер штрих-кодов</Text>
              </View>
              <View style={styles.featureChip}>
                <Flame size={16} color="#EF4444" />
                <Text style={styles.featureText}>Подсчёт калорий</Text>
              </View>
              <View style={styles.featureChip}>
                <Droplet size={16} color="#3B82F6" />
                <Text style={styles.featureText}>Трекер воды</Text>
              </View>
            </View> */}
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === "login" && styles.toggleActive]}
                onPress={() => setMode("login")}
              >
                <Text style={[styles.toggleText, mode === "login" && styles.toggleTextActive]}>
                  Вход
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === "register" && styles.toggleActive]}
                onPress={() => setMode("register")}
              >
                <Text style={[styles.toggleText, mode === "register" && styles.toggleTextActive]}>
                  Регистрация
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.logoHolder}>{renderLogo()}</View>

            {mode === "login" ? (
              <>
                <View style={styles.inputWrap}>
                  <Mail size={18} color="#6B7380" />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#A0A7B4"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Lock size={18} color="#6B7380" />
                  <TextInput
                    placeholder="Пароль"
                    placeholderTextColor="#A0A7B4"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPass((s) => !s)}>
                    {showPass ? <EyeOff size={18} color="#6B7380" /> : <Eye size={18} color="#6B7380" />}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.disabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.primaryText}>{loading ? "Входим..." : "Войти"}</Text>
                </TouchableOpacity>

                <Text style={styles.switchText}>
                  Нет аккаунта?{" "}
                  <Text style={styles.link} onPress={() => setMode("register")}>
                    Зарегистрироваться
                  </Text>
                </Text>
              </>
            ) : (
              <>
                <View style={styles.inputWrap}>
                  <Mail size={18} color="#6B7380" />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#A0A7B4"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Lock size={18} color="#6B7380" />
                  <TextInput
                    placeholder="Пароль"
                    placeholderTextColor="#A0A7B4"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPass((s) => !s)}>
                    {showPass ? <EyeOff size={18} color="#6B7380" /> : <Eye size={18} color="#6B7380" />}
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrap}>
                  <Lock size={18} color="#6B7380" />
                  <TextInput
                    placeholder="Подтвердите пароль"
                    placeholderTextColor="#A0A7B4"
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPass2}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPass2((s) => !s)}>
                    {showPass2 ? <EyeOff size={18} color="#6B7380" /> : <Eye size={18} color="#6B7380" />}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.disabled]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.primaryText}>{loading ? "Регистрируем..." : "Создать аккаунт"}</Text>
                </TouchableOpacity>

                <Text style={styles.switchText}>
                  Уже есть аккаунт?{" "}
                  <Text style={styles.link} onPress={() => setMode("login")}>
                    Войти
                  </Text>
                </Text>
              </>
            )}
          </View>

          {/* о приложении */}
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Почему FoodScanner?</Text>
            <Text style={styles.aboutText}>
              Сканер штрих-кодов, дневник питания, трекер воды и понятная статистика — в одном
              минималистичном приложении. Питайся осознанно и следи за прогрессом каждый день.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const UI = {
  bg: "#EEF2FF",
  card: "#FFFFFF",
  border: "#E4E7EC",
  text: "#0B1220",
  sub: "#667085",
  primary: "#5B7CFF",
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: UI.bg },
  scrollContainer: { paddingBottom: 40 },
  wrap: { paddingHorizontal: 18, paddingTop: 8 },

  // blobs
  blobA: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: "#CFE2FF",
    opacity: 0.35,
    borderRadius: 999,
    top: -width * 0.45,
    left: -width * 0.2,
  },
  blobB: {
    position: "absolute",
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: "#D9D6FF",
    opacity: 0.35,
    borderRadius: 999,
    top: -width * 0.25,
    right: -width * 0.2,
  },
  blobC: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: "#E6F0FF",
    opacity: 0.35,
    borderRadius: 999,
    bottom: -width * 0.55,
    right: -width * 0.3,
  },

  hero: { paddingTop: 8, paddingBottom: 16 },
  brand: { fontSize: 34, fontWeight: "900", color: UI.text, letterSpacing: 0.5 },
  tagline: { marginTop: 6, fontSize: 14, color: UI.sub },

  featuresRow: { marginTop: 14, flexDirection: "row", gap: 8, flexWrap: "wrap" },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FAFAFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  featureText: { color: UI.text, fontWeight: "700", fontSize: 12 },

  card: {
    backgroundColor: UI.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#F6F7FF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 4,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleActive: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: UI.border },
  toggleText: { fontSize: 14, color: "#6B7380", fontWeight: "700" },
  toggleTextActive: { color: UI.text },

  logoHolder: {
    height: 120,
    borderRadius: 16,
    backgroundColor: "#FAFAFF",
    borderWidth: 1,
    borderColor: UI.border,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: "70%", height: "70%" },
  logoText: { fontSize: 22, fontWeight: "800", color: UI.text },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 12,
    height: 50,
    marginTop: 10,
  },
  input: { flex: 1, color: UI.text, fontSize: 15 },

  primaryBtn: {
    marginTop: 14,
    backgroundColor: UI.primary,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5B7CFF",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.7 },

  switchText: { textAlign: "center", color: UI.sub, marginTop: 10 },
  link: { color: UI.primary, fontWeight: "800" },

  aboutCard: {
    marginTop: 16,
    backgroundColor: UI.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: UI.border,
    padding: 16,
  },
  aboutTitle: { fontSize: 16, fontWeight: "800", color: UI.text, marginBottom: 6 },
  aboutText: { fontSize: 14, color: UI.sub, lineHeight: 20 },
});
