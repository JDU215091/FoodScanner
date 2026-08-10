// screens/AddFoodScreen.js
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { ArrowLeft, Search, Camera, Save, X } from "lucide-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

const R = 22;
const C = { bg:"#EEF2FF", card:"#FFFFFF", border:"#E4E7EC", text:"#0B1220", sub:"#667085", primary:"#5B7CFF" };


export default function AddFoodScreen({ navigation }) {
  const [foodName, setFoodName] = useState("")
  const [calories, setCalories] = useState("")
  const [proteins, setProteins] = useState("")
  const [fats, setFats] = useState("")
  const [carbs, setCarbs] = useState("")
  const [portion, setPortion] = useState("100")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock food database
  const commonFoods = [
    { name: "Яблоко", calories: 52, proteins: 0.3, fats: 0.2, carbs: 14, portion: 100 },
    { name: "Банан", calories: 89, proteins: 1.1, fats: 0.3, carbs: 22.8, portion: 100 },
    { name: "Куриная грудка", calories: 165, proteins: 31, fats: 3.6, carbs: 0, portion: 100 },
    { name: "Овсянка", calories: 68, proteins: 2.5, fats: 1.4, carbs: 12, portion: 100 },
    { name: "Творог 5%", calories: 121, proteins: 18, fats: 5, carbs: 3, portion: 100 },
    { name: "Гречка", calories: 132, proteins: 4.5, fats: 1.1, carbs: 25, portion: 100 },
    { name: "Яйцо", calories: 157, proteins: 13, fats: 11, carbs: 1, portion: 100 },
  ]

  const selectFood = (food) => {
    setFoodName(food.name)
    setCalories(food.calories.toString())
    setProteins(food.proteins.toString())
    setFats(food.fats.toString())
    setCarbs(food.carbs.toString())
    setPortion(food.portion.toString())
  }

  const clearForm = () => {
    setFoodName("")
    setCalories("")
    setProteins("")
    setFats("")
    setCarbs("")
    setPortion("100")
  }

  const saveFood = async () => {
    if (!foodName || !calories) {
      Alert.alert("Ошибка", "Введите название продукта и калории")
      return
    }

    try {
      const newFood = {
        id: Date.now(),
        name: foodName,
        calories: Number.parseInt(calories),
        proteins: Number.parseFloat(proteins) || 0,
        fats: Number.parseFloat(fats) || 0,
        carbs: Number.parseFloat(carbs) || 0,
        portion: Number.parseInt(portion) || 100,
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      // Get existing foods
      const existingFoods = await AsyncStorage.getItem("todayFoods")
      const foods = existingFoods ? JSON.parse(existingFoods) : []

      // Add new food
      const updatedFoods = [newFood, ...foods]
      await AsyncStorage.setItem("todayFoods", JSON.stringify(updatedFoods))

      // Update total calories eaten
      const totalCalories = updatedFoods.reduce((sum, food) => sum + food.calories, 0)
      await AsyncStorage.setItem("caloriesEaten", totalCalories.toString())

      Alert.alert("Успешно", "Продукт добавлен в журнал питания", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      console.error("Error saving food:", error)
      Alert.alert("Ошибка", "Не удалось сохранить продукт")
    }
  }

  const filteredFoods = searchQuery
    ? commonFoods.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : commonFoods

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9EEFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#1E293B" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Добавить продукт</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
            <X color="#64748B" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Search size={18} color="#64748B" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Поиск продуктов"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Common Foods */}
            {searchQuery ? (
              <View style={styles.commonFoodsContainer}>
                <Text style={styles.sectionTitle}>Результаты поиска</Text>
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food, index) => (
                    <TouchableOpacity key={index} style={styles.foodItem} onPress={() => selectFood(food)}>
                      <View>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodPortion}>{food.portion}г</Text>
                      </View>
                      <Text style={styles.foodCalories}>{food.calories} ккал</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noResultsText}>Ничего не найдено</Text>
                )}
              </View>
            ) : (
              <View style={styles.commonFoodsContainer}>
                <Text style={styles.sectionTitle}>Популярные продукты</Text>
                {commonFoods.map((food, index) => (
                  <TouchableOpacity key={index} style={styles.foodItem} onPress={() => selectFood(food)}>
                    <View>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodPortion}>{food.portion}г</Text>
                    </View>
                    <Text style={styles.foodCalories}>{food.calories} ккал</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Manual Entry Form */}
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Ручной ввод</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Название продукта:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Введите название"
                  value={foodName}
                  onChangeText={setFoodName}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Калории:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ккал"
                    keyboardType="numeric"
                    value={calories}
                    onChangeText={setCalories}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.inputLabel}>Порция (г):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="100"
                    keyboardType="numeric"
                    value={portion}
                    onChangeText={setPortion}
                  />
                </View>
              </View>

              <Text style={styles.macrosTitle}>Макронутриенты (г):</Text>
              <View style={styles.macrosContainer}>
                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Белки</Text>
                  <TextInput
                    style={styles.macroInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={proteins}
                    onChangeText={setProteins}
                  />
                </View>
                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Жиры</Text>
                  <TextInput
                    style={styles.macroInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={fats}
                    onChangeText={setFats}
                  />
                </View>
                <View style={styles.macroInputGroup}>
                  <Text style={styles.macroLabel}>Углеводы</Text>
                  <TextInput
                    style={styles.macroInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={carbs}
                    onChangeText={setCarbs}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveFood}>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create(
{
  container: { flex: 1, backgroundColor: C.bg },
  keyboardAvoidingView: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.bg },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  headerTitle: { fontSize: 20, fontWeight: "800", color: C.text },
  clearButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  searchContainer: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 },
  searchInputContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#F7F8FF", borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, height: 48 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: C.text },
  commonFoodsContainer: { backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 8 },
  foodItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAFAFF", borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  foodName: { fontSize: 15, color: C.text, fontWeight: "700" },
  foodPortion: { fontSize: 12, color: C.sub, marginTop: 2 },
  foodCalories: { fontSize: 14, color: C.primary, fontWeight: "800" },
  noResultsText: { color: C.sub, paddingVertical: 8 },
  formContainer: { backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, color: C.sub, marginBottom: 6 },
  input: { backgroundColor: "#F7F8FF", borderRadius: 12, height: 46, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border, fontSize: 15, color: C.text },
  inputRow: { flexDirection: "row", gap: 12 },
  macrosTitle: { fontSize: 14, fontWeight: "800", color: C.text, marginTop: 6, marginBottom: 8 },
  macrosContainer: { flexDirection: "row", gap: 10 },
  macroInputGroup: { flex: 1 },
  macroLabel: { fontSize: 12, color: C.sub, marginBottom: 6 },
  macroInput: { backgroundColor: "#F7F8FF", borderRadius: 12, height: 46, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border, fontSize: 15, color: C.text },
  saveButton: { marginTop: 8, backgroundColor: C.primary, borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" }
}
);