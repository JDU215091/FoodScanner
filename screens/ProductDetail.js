// ProductDetail.js
import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

export default function ProductDetail({ route }) {
  const { product } = route.params;

  let title = "Без названия";
  let brand = "Неизвестно";
  let imageUrl = null;
  let nutrients = null;
  let ingredients = ""; // Теперь ingredients будет строкой

  if (product.__source === 'foodrepo') {
    // ИСПРАВЛЕНО: Безопасная проверка на тип перед доступом к полям translations
    const translations = product.name_translations || {};
    title =
      (typeof translations.en === 'string' && translations.en) ||
      (typeof translations.de === 'string' && translations.de) ||
      (typeof translations.fr === 'string' && translations.fr) ||
      (typeof translations.it === 'string' && translations.it) ||
      "Без названия";

    // ИСПРАВЛЕНО: Безопасная проверка на тип и существование массива images
    const frontImage = Array.isArray(product.images) ? product.images.find(img =>
      Array.isArray(img.categories) && img.categories.includes("Front")
    ) : null;
    // ИСПРАВЛЕНО: Безопасная проверка на тип перед доступом к полям изображения
    const largeUrl = frontImage && typeof frontImage.large === 'string' ? frontImage.large.trim() : '';
    const mediumUrl = frontImage && typeof frontImage.medium === 'string' ? frontImage.medium.trim() : '';
    imageUrl = largeUrl || mediumUrl || null;

    // ИСПРАВЛЕНО: Безопасная проверка на тип перед присвоением brand
    brand = (typeof product.brand === 'string' && product.brand) || "FoodRepo Product";

    // ИСПРАВЛЕНО: Попытка получить состав на русском языке
    const ingredientsTranslations = product.ingredients_translations || {};
    ingredients = (typeof ingredientsTranslations.ru === 'string' && ingredientsTranslations.ru) || // Сначала русский
                  (typeof ingredientsTranslations.en === 'string' && ingredientsTranslations.en) || // Потом английский
                  (typeof ingredientsTranslations.de === 'string' && ingredientsTranslations.de) || // Потом немецкий
                  (typeof ingredientsTranslations.fr === 'string' && ingredientsTranslations.fr) || // Потом французский
                  (typeof ingredientsTranslations.it === 'string' && ingredientsTranslations.it) || // Потом итальянский
                  "";

    // FoodRepo не всегда возвращает nutrients — оставим пустым
    nutrients = null;
  } else {
    // Open Food Facts
    // ИСПРАВЛЕНО: Безопасная проверка на тип перед присвоением
    title = (typeof product.product_name === 'string' && product.product_name) || "Без названия";
    brand = (typeof product.brands === 'string' && product.brands) || "Неизвестно";
    imageUrl = (typeof product.image_url === 'string' && product.image_url) || null;
    // ИСПРАВЛЕНО: Проверка, что nutrients - это объект
    nutrients = (product.nutriments && typeof product.nutriments === 'object') ? product.nutriments : null;
    // ИСПРАВЛЕНО: Попытка получить состав на русском языке
    // Сначала пытаемся получить из product.ingredients_text_with_allergens, если он есть
    let fullIngredientsText = (typeof product.ingredients_text_with_allergens === 'string' && product.ingredients_text_with_allergens) ||
                              (typeof product.ingredients_text === 'string' && product.ingredients_text) ||
                              "";
    // Извлекаем текст состава на русском, если он есть в другом поле
    // Обычно OFFF хранит переводы в product.ingredients_text_ru
    const russianIngredients = (typeof product['ingredients_text_ru'] === 'string' && product['ingredients_text_ru']) || "";
    // Используем русский текст, если он есть, иначе основной
    ingredients = russianIngredients || fullIngredientsText;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Изображение продукта с оберткой для карточки */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>Нет изображения</Text>
          </View>
        )}
      </View>

      {/* Основная информация с оберткой для карточки */}
      <View style={styles.infoCard}>
        {/* ИСПРАВЛЕНО: Добавлена проверка на тип перед отображением */}
        <Text style={styles.title}>{typeof title === 'string' ? title : 'Без названия'}</Text>
        {/* ИСПРАВЛЕНО: Добавлена проверка на тип перед отображением */}
        <Text style={styles.brand}>Бренд: {typeof brand === 'string' ? brand : 'Неизвестно'}</Text>
      </View>

      {/* Секция состава с оберткой для карточки */}
      {typeof ingredients === 'string' && ingredients ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Состав:</Text>
          {/* ИСПРАВЛЕНО: Добавлена проверка на тип перед отображением */}
          <Text style={styles.ingredientsText}>{typeof ingredients === 'string' ? ingredients : ''}</Text>
        </View>
      ) : null}

      {/* Секция питательных веществ с оберткой для карточки */}
      {nutrients && typeof nutrients === 'object' && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Пищевая ценность (на 100г):</Text>
          <View style={styles.nutrientsContainer}>
            {/* ИСПРАВЛЕНО: Безопасная проверка на тип и существование ключа перед отображением */}
            {typeof nutrients["energy-kcal_100g"] !== 'undefined' && nutrients["energy-kcal_100g"] !== null && (
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Калории:</Text>
                <Text style={styles.nutrientValue}>{typeof nutrients["energy-kcal_100g"] === 'number' ? nutrients["energy-kcal_100g"] : nutrients["energy-kcal_100g"]} ккал</Text>
              </View>
            )}
            {/* ИСПРАВЛЕНО: Безопасная проверка на тип и существование ключа перед отображением */}
            {typeof nutrients.proteins_100g !== 'undefined' && nutrients.proteins_100g !== null && (
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Белки:</Text>
                <Text style={styles.nutrientValue}>{typeof nutrients.proteins_100g === 'number' ? nutrients.proteins_100g : nutrients.proteins_100g} г</Text>
              </View>
            )}
            {/* ИСПРАВЛЕНО: Безопасная проверка на тип и существование ключа перед отображением */}
            {typeof nutrients.fat_100g !== 'undefined' && nutrients.fat_100g !== null && (
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Жиры:</Text>
                <Text style={styles.nutrientValue}>{typeof nutrients.fat_100g === 'number' ? nutrients.fat_100g : nutrients.fat_100g} г</Text>
              </View>
            )}
            {/* ИСПРАВЛЕНО: Безопасная проверка на тип и существование ключа перед отображением */}
            {typeof nutrients.carbohydrates_100g !== 'undefined' && nutrients.carbohydrates_100g !== null && (
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Углеводы:</Text>
                <Text style={styles.nutrientValue}>{typeof nutrients.carbohydrates_100g === 'number' ? nutrients.carbohydrates_100g : nutrients.carbohydrates_100g} г</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa", // Светлый фон
  },
  imageContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff', // Белый фон для карточки изображения
    margin: 10,
    borderRadius: 12,
    elevation: 2, // Тень для Android
    shadowColor: "#000", // Тень для iOS
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: "80%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  noImage: {
    width: "80%",
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
  },
  noImageText: {
    color: "#6b7280",
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff', // Белый фон для карточки информации
    margin: 10,
    padding: 20,
    borderRadius: 12,
    elevation: 2, // Тень для Android
    shadowColor: "#000", // Тень для iOS
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: '#ffffff', // Белый фон для карточки секции
    margin: 10,
    padding: 20,
    borderRadius: 12,
    elevation: 2, // Тень для Android
    shadowColor: "#000", // Тень для iOS
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  ingredientsText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
  },
  nutrientsContainer: {
    flexDirection: 'column',
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  nutrientLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: "#334155",
  },
  nutrientValue: {
    fontSize: 15,
    color: "#64748b",
  },
});

// import React from "react";
// import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

// export default function ProductDetail({ route }) {
//   const { product } = route.params;

//   let title = "Без названия";
//   let brand = "Неизвестно";
//   let imageUrl = null;
//   let nutrients = null;
//   let ingredients = "";

//   if (product.__source === 'foodrepo') {
//     title =
//       product.name_translations?.en ||
//       product.name_translations?.de ||
//       product.name_translations?.fr ||
//       product.name_translations?.it ||
//       "Без названия";

//     const frontImage = product.images?.find(img =>
//       img.categories?.includes("Front")
//     );
//     imageUrl = (frontImage?.large || frontImage?.medium || '').trim();

//     brand = "Naturaplan"; // или динамически, если будет поле
//     ingredients = product.ingredients_translations?.en || 
//                   product.ingredients_translations?.de || 
//                   product.ingredients_translations?.fr || 
//                   "";

//     // FoodRepo не всегда возвращает nutrients — оставим пустым
//     nutrients = null;
//   } else {
//     // Open Food Facts
//     title = product.product_name || "Без названия";
//     brand = product.brands || "Неизвестно";
//     imageUrl = product.image_url || null;
//     nutrients = product.nutriments || null;
//     ingredients = product.ingredients_text || "";
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {imageUrl ? (
//         <Image source={{ uri: imageUrl }} style={styles.image} />
//       ) : null}

//       <Text style={styles.title}>{title}</Text>
//       <Text style={styles.brand}>Бренд: {brand}</Text>

//       {ingredients ? (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Состав:</Text>
//           <Text>{ingredients}</Text>
//         </View>
//       ) : null}

//       {nutrients && (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Пищевая ценность (на 100г):</Text>
//           {nutrients["energy-kcal_100g"] && (
//             <Text>Калории: {nutrients["energy-kcal_100g"]} ккал</Text>
//           )}
//           {nutrients.proteins_100g && (
//             <Text>Белки: {nutrients.proteins_100g} г</Text>
//           )}
//           {nutrients.fat_100g && <Text>Жиры: {nutrients.fat_100g} г</Text>}
//           {nutrients.carbohydrates_100g && (
//             <Text>Углеводы: {nutrients.carbohydrates_100g} г</Text>
//           )}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 20 },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   brand: { fontSize: 16, marginBottom: 20, color: "#555" },
//   section: { marginTop: 20 },
//   sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
// });