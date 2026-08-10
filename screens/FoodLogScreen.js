// screens/FoodLogScreen.js
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
} from "react-native"
import { ArrowLeft, Plus, Search, Filter, Trash2, Edit2 } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context" // ✅ Импортировано отсюда
import AsyncStorage from "@react-native-async-storage/async-storage"

const R = 22;
const C = { bg:"#EEF2FF", card:"#FFFFFF", border:"#E4E7EC", text:"#0B1220", sub:"#667085", primary:"#5B7CFF" };


export default function FoodLogScreen({ navigation }) {
  const [foods, setFoods] = useState([])
  const [dailyTotal, setDailyTotal] = useState({
    calories: 0,
    proteins: 0,
    fats: 0,
    carbs: 0,
  })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedFood, setSelectedFood] = useState(null)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)

  useEffect(() => {
    loadFoods()
  }, [])

  const loadFoods = async () => {
    try {
      const savedFoods = await AsyncStorage.getItem("todayFoods")
      if (savedFoods) {
        const parsedFoods = JSON.parse(savedFoods)
        setFoods(parsedFoods)
        calculateTotals(parsedFoods)
      }
    } catch (error) {
      console.error("Error loading foods:", error)
    }
  }

  const calculateTotals = (foodList) => {
    const totals = foodList.reduce(
      (acc, food) => {
        return {
          calories: acc.calories + (food.calories || 0),
          proteins: acc.proteins + (food.proteins || 0),
          fats: acc.fats + (food.fats || 0),
          carbs: acc.carbs + (food.carbs || 0),
        }
      },
      { calories: 0, proteins: 0, fats: 0, carbs: 0 },
    )
    setDailyTotal(totals)
  }

  const deleteFood = async (id) => {
    try {
      const updatedFoods = foods.filter((food) => food.id !== id)
      setFoods(updatedFoods)
      calculateTotals(updatedFoods)
      await AsyncStorage.setItem("todayFoods", JSON.stringify(updatedFoods))

      // Update total calories eaten
      const totalCalories = updatedFoods.reduce((sum, food) => sum + (food.calories || 0), 0)
      await AsyncStorage.setItem("caloriesEaten", totalCalories.toString())

      setIsDeleteModalVisible(false)
      setSelectedFood(null)
    } catch (error) {
      console.error("Error deleting food:", error)
    }
  }

  const confirmDelete = (food) => {
    setSelectedFood(food)
    setIsDeleteModalVisible(true)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getMealTypeIcon = (time) => {
    const hour = Number.parseInt(time.split(":")[0])
    if (hour < 12) return "🍳"
    if (hour < 16) return "🍲"
    if (hour < 20) return "🍽️"
    return "🌙"
  }

  const getMealType = (time) => {
    const hour = Number.parseInt(time.split(":")[0])
    if (hour < 12) return "Завтрак"
    if (hour < 16) return "Обед"
    if (hour < 20) return "Ужин"
    return "Перекус"
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9EEFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Журнал питания</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddFood")}>
          <Plus color="#3B82F6" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Date Display */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </View>

          {/* Nutrition Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Итоги дня</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{dailyTotal.calories}</Text>
                <Text style={styles.summaryLabel}>Калории</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{dailyTotal.proteins.toFixed(1)}г</Text>
                <Text style={styles.summaryLabel}>Белки</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{dailyTotal.fats.toFixed(1)}г</Text>
                <Text style={styles.summaryLabel}>Жиры</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{dailyTotal.carbs.toFixed(1)}г</Text>
                <Text style={styles.summaryLabel}>Углеводы</Text>
              </View>
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <TouchableOpacity style={styles.searchButton}>
              <Search size={18} color="#64748B" />
              <Text style={styles.searchText}>Поиск продуктов</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={18} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Food List */}
          <View style={styles.foodListContainer}>
            <Text style={styles.sectionTitle}>Приемы пищи</Text>

            {foods.length > 0 ? (
              foods.map((food) => (
                <View key={food.id} style={styles.foodItem}>
                  <View style={styles.foodItemHeader}>
                    <View style={styles.mealTypeContainer}>
                      <Text style={styles.mealTypeIcon}>{getMealTypeIcon(food.time)}</Text>
                      <Text style={styles.mealType}>{getMealType(food.time)}</Text>
                      <Text style={styles.foodTime}>{food.time}</Text>
                    </View>
                    <View style={styles.foodActions}>
                      <TouchableOpacity style={styles.actionButton} onPress={() => confirmDelete(food)}>
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Edit2 size={16} color="#3B82F6" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.foodDetails}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodCalories}>{food.calories} ккал</Text>
                  </View>

                  <View style={styles.macrosContainer}>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{food.proteins?.toFixed(1) || 0}г</Text>
                      <Text style={styles.macroLabel}>Белки</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{food.fats?.toFixed(1) || 0}г</Text>
                      <Text style={styles.macroLabel}>Жиры</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={styles.macroValue}>{food.carbs?.toFixed(1) || 0}г</Text>
                      <Text style={styles.macroLabel}>Углеводы</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Нет записей о питании</Text>
                <Text style={styles.emptyText}>Добавьте свой первый прием пищи</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate("AddFood")}>
                  <Plus size={18} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Добавить еду</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Удалить запись?</Text>
            <Text style={styles.modalText}>
              Вы уверены, что хотите удалить "{selectedFood?.name}" из журнала питания?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => deleteFood(selectedFood?.id)}
              >
                <Trash2 size={16} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create(
{
  container: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.bg },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  headerTitle: { fontSize: 20, fontWeight: "800", color: C.text },
  addButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  dateContainer: { marginBottom: 10 },
  dateText: { color: C.sub, fontSize: 13 },
  summaryContainer: { backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  summaryTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 10 },
  summaryGrid: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { width: "24%", backgroundColor: "#FAFAFF", borderRadius: 14, borderWidth: 1, borderColor: C.border, alignItems: "center", paddingVertical: 10 },
  summaryValue: { fontSize: 16, fontWeight: "800", color: C.text },
  summaryLabel: { fontSize: 12, color: C.sub },
  searchContainer: { flexDirection: "row", gap: 10, marginBottom: 12 },
  searchButton: { flex: 1, height: 46, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: "#F7F8FF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  searchText: { color: C.sub, fontSize: 14 },
  filterButton: { width: 46, height: 46, borderRadius: 12, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  foodListContainer: { backgroundColor: C.card, borderRadius: R, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: C.text, marginBottom: 10 },
  foodItem: { backgroundColor: "#FAFAFF", borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 12 },
  foodItemHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  mealTypeContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  mealTypeIcon: { fontSize: 16 },
  mealType: { color: C.text, fontWeight: "700" },
  foodTime: { color: C.sub, fontSize: 12 },
  foodActions: { flexDirection: "row", gap: 8 },
  actionButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  foodDetails: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  foodName: { color: C.text, fontWeight: "800", fontSize: 15 },
  foodCalories: { color: C.primary, fontWeight: "800" },
  macrosContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  macroItem: { alignItems: "center", width: "32%", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingVertical: 8 },
  macroValue: { fontWeight: "800", color: C.text },
  macroLabel: { fontSize: 12, color: C.sub },
  emptyContainer: { alignItems: "center", paddingVertical: 24 },
  emptyTitle: { fontWeight: "800", color: C.text, fontSize: 16 },
  emptyText: { color: C.sub, marginTop: 4 },
  emptyButton: { marginTop: 10, backgroundColor: C.primary, borderRadius: 999, height: 48, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 8 },
  emptyButtonText: { color: "#fff", fontWeight: "800" },
  modalContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { width: 320, backgroundColor: C.card, borderRadius: R, padding: 16, borderWidth: 1, borderColor: C.border },
  modalTitle: { fontWeight: "800", color: C.text, fontSize: 16, marginBottom: 6 },
  modalText: { color: C.sub, marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalButton: { height: 44, borderRadius: 12, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  cancelButton: { backgroundColor: "#F7F8FF", borderWidth: 1, borderColor: C.border },
  cancelButtonText: { color: C.text, fontWeight: "700" },
  deleteButton: { backgroundColor: "#EF4444" },
  deleteButtonText: { color: "#fff", fontWeight: "800" }
}
);