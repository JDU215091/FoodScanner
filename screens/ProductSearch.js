import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

export default function ProductSearch({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_KEY = "30b08bea0d89f631a60dc57bfd153844"; // FoodRepo API Key

  const searchProduct = async (reset = true) => {
    if (!query.trim()) return;

    try {
      if (reset) {
        setLoading(true);
      }

      if (/^\d+$/.test(query)) {
        // Поиск по штрихкоду в FoodRepo
        const response = await fetch(
          `https://www.foodrepo.org/api/v3/products?barcodes_ean13=${query}`,
          {
            headers: {
              Authorization: `Token token=${API_KEY}`,
            },
          }
        );
        const json = await response.json();
        // FoodRepo возвращает plain-объекты в data
        const foodRepoItems = (json.data || []).map(item => ({
          ...item,
          __source: 'foodrepo',
        }));
        setResults(foodRepoItems);
        setHasMore(false);
      } else {
        // Поиск по названию в Open Food Facts
        // ИСПРАВЛЕНО: Удалены лишние пробелы перед https
        const response = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
            query
          )}&page=${reset ? 1 : page}&page_size=20&sort_by=unique_scans_n&json=1`
        );
        const json = await response.json();

        // ИСПРАВЛЕНО: Проверка, что json.products существует и является массивом
        const offProducts = json.products || [];
        const offItems = offProducts.map(item => ({
          ...item,
          __source: 'off',
        }));

        if (reset) {
          setResults(offItems);
          setPage(2);
        } else {
          setResults((prev) => [...prev, ...offItems]);
          setPage((prev) => prev + 1);
        }

        // ИСПРАВЛЕНО: Проверка длины offProducts для hasMore
        setHasMore(offProducts.length > 0);
      }
    } catch (error) {
      console.error("Search error:", error);
      // ИСПРАВЛЕНО: Очищаем результаты при ошибке
      setResults([]);
      // Оставляем hasMore как false, чтобы не пытаться грузить больше
      setHasMore(false);
    } finally {
      if (loading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    searchProduct(true);
  };

  const renderItem = ({ item }) => {
    let title = "Без названия";
    let brand = "Неизвестно";
    let imageUrl = null;

    if (item.__source === 'foodrepo') {
      // FoodRepo: plain объект с name_translations
      // ИСПРАВЛЕНО: Добавлена безопасная проверка на тип и существование полей
      const translations = item.name_translations || {};
      title =
        (typeof translations.en === 'string' && translations.en) ||
        (typeof translations.de === 'string' && translations.de) ||
        (typeof translations.fr === 'string' && translations.fr) ||
        (typeof translations.it === 'string' && translations.it) ||
        "Без названия";

      // Ищем первое изображение с категорией "Front"
      // ИСПРАВЛЕНО: Добавлена безопасная проверка на массив images
      const frontImage = Array.isArray(item.images) ? item.images.find(img =>
        Array.isArray(img.categories) && img.categories.includes("Front")
      ) : null;
      // ИСПРАВЛЕНО: Проверка на существование frontImage и medium
      imageUrl = (frontImage && typeof frontImage.medium === 'string') ? frontImage.medium.trim() : '';

      // ИСПРАВЛЕНО: Убрана жесткая привязка к "Naturaplan"
      brand = "FoodRepo"; // или "Неизвестно", если данные бренда отсутствуют
    } else {
      // Open Food Facts
      // ИСПРАВЛЕНО: Безопасная проверка на тип
      title = (typeof item.product_name === 'string' && item.product_name) || "Без названия";
      brand = (typeof item.brands === 'string' && item.brands) || "Неизвестно";
      imageUrl = (typeof item.image_url === 'string' && item.image_url) || null;
    }

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate("ProductDetail", { product: item })}
        activeOpacity={0.8}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={{ color: "#888" }}>Нет фото</Text>
          </View>
        )}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {/* ИСПРАВЛЕНО: Добавлена проверка на тип перед numberOfLines */}
          <Text style={styles.title} numberOfLines={typeof title === 'string' && title.length > 30 ? 2 : 1}>
            {title}
          </Text>
          {/* ИСПРАВЛЕНО: Добавлена проверка на тип перед numberOfLines */}
          <Text style={styles.brand} numberOfLines={typeof brand === 'string' && brand.length > 20 ? 1 : 1}>
            Бренд: {brand}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Введите название или штрихкод"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={() => searchProduct(true)}
          placeholderTextColor="#a0aec0"
        />
        <Button title="Поиск" onPress={() => searchProduct(true)} color="#4f46e5" />
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Поиск...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) =>
            // ИСПРАВЛЕНО: Добавлена проверка на существование id/_id
            (item.id || item._id || `${index}_${item.__source || 'unknown'}`).toString()
          }
          renderItem={renderItem}
          onEndReached={() => {
            if (!loading && hasMore && !/^\d+$/.test(query)) {
              searchProduct(false);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && results.length > 0 ? (
              <ActivityIndicator size="small" color="#4f46e5" style={{ margin: 10 }} />
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4f46e5"]} />
          }
          contentContainerStyle={results.length === 0 && !loading ? styles.emptyContainer : null}
          ListEmptyComponent={results.length === 0 && !loading ? <Text style={styles.emptyText}>Ничего не найдено</Text> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#f3f4f6",
    fontSize: 16,
    color: "#1f2937",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 64,
    height: 64,
    marginRight: 16,
    borderRadius: 8,
    resizeMode: "cover",
  },
  noImage: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 2,
  },
  brand: {
    fontSize: 14,
    color: "#6b7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: "#6b7280",
  },
});



// import React, { useState } from "react";
// import {
//   View,
//   TextInput,
//   Button,
//   Text,
//   FlatList,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";

// export default function ProductSearch({ navigation }) {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   const API_KEY = "30b08bea0d89f631a60dc57bfd153844"; // FoodRepo API Key

//   const searchProduct = async (reset = true) => {
//     if (!query.trim()) return;

//     try {
//       setLoading(true);

//       if (/^\d+$/.test(query)) {
//         // Поиск по штрихкоду в FoodRepo
//         const response = await fetch(
//           `https://www.foodrepo.org/api/v3/products?barcodes_ean13=${query}`,
//           {
//             headers: {
//               Authorization: `Token token=${API_KEY}`,
//             },
//           }
//         );
//         const json = await response.json();
//         // FoodRepo возвращает plain-объекты в data
//         const foodRepoItems = (json.data || []).map(item => ({
//           ...item,
//           __source: 'foodrepo',
//         }));
//         setResults(foodRepoItems);
//         setHasMore(false);
//       } else {
//         // Поиск по названию в Open Food Facts
//         // ИСПРАВЛЕНО: Удалены лишние пробелы перед https
//         const response = await fetch(
//           `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
//             query
//           )}&page=${reset ? 1 : page}&page_size=20&sort_by=unique_scans_n&json=1`
//         );
//         const json = await response.json();

//         const offItems = (json.products || []).map(item => ({
//           ...item,
//           __source: 'off',
//         }));

//         if (reset) {
//           setResults(offItems);
//           setPage(2);
//         } else {
//           setResults((prev) => [...prev, ...offItems]);
//           setPage((prev) => prev + 1);
//         }

//         setHasMore(offItems.length > 0);
//       }
//     } catch (error) {
//       console.error("Search error:", error);
//       setResults([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderItem = ({ item }) => {
//     let title = "Без названия";
//     let brand = "Неизвестно";
//     let imageUrl = null;

//     if (item.__source === 'foodrepo') {
//       // FoodRepo: plain объект с name_translations
//       title =
//         item.name_translations?.en ||
//         item.name_translations?.de ||
//         item.name_translations?.fr ||
//         item.name_translations?.it ||
//         "Без названия";

//       // Ищем первое изображение с категорией "Front"
//       const frontImage = item.images?.find(img =>
//         img.categories?.includes("Front")
//       );
//       imageUrl = (frontImage?.medium || '').trim();

//       brand = "Naturaplan"; // или "Неизвестно", если нет данных
//     } else {
//       // Open Food Facts
//       title = item.product_name || "Без названия";
//       brand = item.brands || "Неизвестно";
//       imageUrl = item.image_url || null;
//     }

//     return (
//       <TouchableOpacity
//         style={styles.item}
//         onPress={() => navigation.navigate("ProductDetail", { product: item })}
//       >
//         {imageUrl ? (
//           <Image source={{ uri: imageUrl }} style={styles.image} />
//         ) : (
//           <View style={[styles.image, styles.noImage]}>
//             <Text style={{ color: "#888" }}>Нет фото</Text>
//           </View>
//         )}
//         <View style={{ flex: 1 }}>
//           <Text style={styles.title} numberOfLines={2}>
//             {title}
//           </Text>
//           <Text numberOfLines={1}>Бренд: {brand}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Введите название или штрихкод"
//         value={query}
//         onChangeText={setQuery}
//         returnKeyType="search"
//         onSubmitEditing={() => searchProduct(true)}
//       />
//       <Button title="Поиск" onPress={() => searchProduct(true)} />

//       {loading && results.length === 0 ? (
//         <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
//       ) : (
//         <FlatList
//           data={results}
//           keyExtractor={(item, index) =>
//             item.id?.toString() || item._id?.toString() || index.toString()
//           }
//           renderItem={renderItem}
//           onEndReached={() => {
//             if (!loading && hasMore && !/^\d+$/.test(query)) {
//               searchProduct(false);
//             }
//           }}
//           onEndReachedThreshold={0.5}
//           ListFooterComponent={
//             loading && results.length > 0 ? (
//               <ActivityIndicator size="small" color="#000" style={{ margin: 10 }} />
//             ) : null
//           }
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     paddingTop: 50, // ✅ Добавлен отступ сверху
//     backgroundColor: "#fff",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     marginTop: 10, // ✅ Дополнительный отступ от верхнего края
//   },
//   item: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   image: {
//     width: 60,
//     height: 60,
//     marginRight: 15,
//     borderRadius: 8,
//     resizeMode: "cover",
//   },
//   noImage: {
//     backgroundColor: "#f0f0f0",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: {
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });