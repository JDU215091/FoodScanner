// utils/allergenUtils.js - Allergen detection and matching logic
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supported allergens with their common synonyms and variations
export const ALLERGENS = {
  milk: {
    id: 'milk',
    name: 'Молоко и молочные продукты',
    nameEn: 'Milk and Dairy Products',
    icon: '🥛',
    synonyms: [
      'milk', 'молоко', 'dairy', 'молочн',
      'butter', 'масло сливочное', 'сливочн',
      'cheese', 'сыр',
      'cream', 'сливк',
      'yogurt', 'йогурт', 'yoghurt',
      'whey', 'сыворотка',
      'casein', 'казеин',
      'lactose', 'лактоз',
      'curd', 'творог'
    ]
  },
  eggs: {
    id: 'eggs',
    name: 'Яйца',
    nameEn: 'Eggs',
    icon: '🥚',
    synonyms: [
      'egg', 'яйц', 'яйч',
      'albumin', 'альбумин',
      'овальбумин', 'ovalbumin',
      'яичн'
    ]
  },
  peanuts: {
    id: 'peanuts',
    name: 'Арахис',
    nameEn: 'Peanuts',
    icon: '🥜',
    synonyms: [
      'peanut', 'арахис',
      'groundnut', 'земляной орех'
    ]
  },
  treeNuts: {
    id: 'treeNuts',
    name: 'Орехи (миндаль, грецкий и др.)',
    nameEn: 'Tree Nuts',
    icon: '🌰',
    synonyms: [
      'almond', 'миндал',
      'walnut', 'грецк',
      'cashew', 'кешью',
      'hazelnut', 'фундук', 'лещин',
      'pecan', 'пекан',
      'pistachio', 'фисташк',
      'macadamia', 'макадам',
      'brazil nut', 'бразильск',
      'орех', 'nut'
    ]
  },
  soy: {
    id: 'soy',
    name: 'Соя',
    nameEn: 'Soy',
    icon: '🫘',
    synonyms: [
      'soy', 'соя', 'сое',
      'soya', 'сою',
      'tofu', 'тофу',
      'lecithin', 'лецитин',
      'edamame', 'эдамам'
    ]
  },
  wheat: {
    id: 'wheat',
    name: 'Пшеница и глютен',
    nameEn: 'Wheat and Gluten',
    icon: '🌾',
    synonyms: [
      'wheat', 'пшениц',
      'gluten', 'глютен', 'клейковин',
      'flour', 'мука',
      'barley', 'ячмен',
      'rye', 'рожь', 'ржан',
      'oat', 'овс', 'овес',
      'spelt', 'спельт'
    ]
  },
  fish: {
    id: 'fish',
    name: 'Рыба',
    nameEn: 'Fish',
    icon: '🐟',
    synonyms: [
      'fish', 'рыб',
      'salmon', 'лосос', 'семг',
      'tuna', 'тунец',
      'cod', 'треск',
      'sardine', 'сардин',
      'anchov', 'анчоус'
    ]
  },
  shellfish: {
    id: 'shellfish',
    name: 'Ракообразные и моллюски',
    nameEn: 'Shellfish and Crustaceans',
    icon: '🦐',
    synonyms: [
      'shellfish', 'моллюск', 'ракообразн',
      'shrimp', 'креветк',
      'prawn', 'креветк',
      'crab', 'краб',
      'lobster', 'омар', 'лобстер',
      'mussel', 'мидия',
      'oyster', 'устриц',
      'clam', 'морск', 'ракушк',
      'squid', 'кальмар',
      'octopus', 'осьминог'
    ]
  },
  sesame: {
    id: 'sesame',
    name: 'Кунжут',
    nameEn: 'Sesame',
    icon: '🌿',
    synonyms: [
      'sesame', 'кунжут',
      'tahini', 'тахини',
      'сезам'
    ]
  }
};

/**
 * Check if an ingredient text contains any allergen from the user's selected allergens
 * @param {string} ingredientsText - The ingredients text to check
 * @param {string[]} userAllergens - Array of allergen IDs the user is allergic to
 * @returns {Object} - { hasAllergen: boolean, detectedAllergens: Array, warnings: Array }
 */
export function checkForAllergens(ingredientsText, userAllergens) {
  const result = {
    hasAllergen: false,
    detectedAllergens: [],
    warnings: []
  };

  // If no user allergens selected, nothing to check
  if (!userAllergens || userAllergens.length === 0) {
    return result;
  }

  // If no ingredients text provided, flag as uncertain
  if (!ingredientsText || ingredientsText.trim() === '' || ingredientsText === 'Нет данных об ингредиентах') {
    result.warnings.push({
      type: 'missing_data',
      message: 'Информация об ингредиентах отсутствует. Невозможно проверить на аллергены.'
    });
    return result;
  }

  // Normalize the ingredients text for checking (lowercase)
  const normalizedText = ingredientsText.toLowerCase();

  // Check each user's selected allergen
  for (const allergenId of userAllergens) {
    const allergen = ALLERGENS[allergenId];
    if (!allergen) continue;

    // Check if any synonym matches in the ingredients
    const matchedSynonyms = allergen.synonyms.filter(synonym => {
      const normalizedSynonym = synonym.toLowerCase();
      
      // Use word boundary check for better accuracy
      // This prevents false positives like "butterscotch" matching "butter"
      const regex = new RegExp(`\\b${normalizedSynonym}`, 'i');
      return regex.test(normalizedText);
    });

    if (matchedSynonyms.length > 0) {
      result.hasAllergen = true;
      result.detectedAllergens.push({
        allergen: allergen,
        matchedTerms: matchedSynonyms
      });
    }
  }

  return result;
}

/**
 * Check allergens from structured allergens data (Open Food Facts API)
 * @param {Object} productData - The full product data object
 * @param {string[]} userAllergens - Array of allergen IDs the user is allergic to
 * @returns {Object} - { hasAllergen: boolean, detectedAllergens: Array, warnings: Array }
 */
export function checkStructuredAllergens(productData, userAllergens) {
  const result = {
    hasAllergen: false,
    detectedAllergens: [],
    warnings: []
  };

  if (!userAllergens || userAllergens.length === 0) {
    return result;
  }

  // Check allergens_tags from Open Food Facts
  if (productData.allergens_tags && Array.isArray(productData.allergens_tags)) {
    for (const allergenTag of productData.allergens_tags) {
      // Tags are in format "en:milk", "en:eggs", etc.
      const tagLower = allergenTag.toLowerCase();
      
      for (const allergenId of userAllergens) {
        const allergen = ALLERGENS[allergenId];
        if (!allergen) continue;

        // Check if tag contains any of our allergen synonyms
        const hasMatch = allergen.synonyms.some(synonym => 
          tagLower.includes(synonym.toLowerCase())
        );

        if (hasMatch) {
          result.hasAllergen = true;
          
          // Avoid duplicates
          if (!result.detectedAllergens.find(d => d.allergen.id === allergenId)) {
            result.detectedAllergens.push({
              allergen: allergen,
              matchedTerms: [allergenTag],
              source: 'structured'
            });
          }
        }
      }
    }
  }

  // Also check allergens_from_ingredients if available
  if (productData.allergens_from_ingredients) {
    const allergensText = productData.allergens_from_ingredients.toLowerCase();
    
    for (const allergenId of userAllergens) {
      const allergen = ALLERGENS[allergenId];
      if (!allergen) continue;

      const hasMatch = allergen.synonyms.some(synonym => 
        allergensText.includes(synonym.toLowerCase())
      );

      if (hasMatch && !result.detectedAllergens.find(d => d.allergen.id === allergenId)) {
        result.hasAllergen = true;
        result.detectedAllergens.push({
          allergen: allergen,
          matchedTerms: ['allergens_from_ingredients'],
          source: 'structured'
        });
      }
    }
  }

  return result;
}

/**
 * Comprehensive allergen check combining structured and text-based detection
 * @param {Object} productData - The full product data object
 * @param {string[]} userAllergens - Array of allergen IDs the user is allergic to
 * @returns {Object} - Complete allergen check result
 */
export function performAllergenCheck(productData, userAllergens) {
  if (!userAllergens || userAllergens.length === 0) {
    return {
      hasAllergen: false,
      detectedAllergens: [],
      warnings: [],
      isDataComplete: true
    };
  }

  // First, check structured allergen data
  const structuredResult = checkStructuredAllergens(productData, userAllergens);

  // Then check ingredients text
  const textResult = checkForAllergens(
    productData.ingredients_text || '',
    userAllergens
  );

  // Combine results
  const combinedResult = {
    hasAllergen: structuredResult.hasAllergen || textResult.hasAllergen,
    detectedAllergens: [...structuredResult.detectedAllergens],
    warnings: [...structuredResult.warnings, ...textResult.warnings],
    isDataComplete: textResult.warnings.length === 0
  };

  // Add text-based detections that aren't already in structured results
  for (const detection of textResult.detectedAllergens) {
    const alreadyDetected = combinedResult.detectedAllergens.find(
      d => d.allergen.id === detection.allergen.id
    );
    
    if (!alreadyDetected) {
      combinedResult.detectedAllergens.push({
        ...detection,
        source: 'ingredients_text'
      });
    }
  }

  return combinedResult;
}

/**
 * Get all available allergens for selection
 * @returns {Array} - Array of allergen objects
 */
export function getAllAllergens() {
  return Object.values(ALLERGENS);
}

/**
 * Save user's allergen preferences to AsyncStorage
 * @param {string} userEmail - User's email
 * @param {string[]} allergenIds - Array of selected allergen IDs
 */
export async function saveUserAllergens(userEmail, allergenIds) {
  try {
    const key = `allergyPreferences_${userEmail}`;
    await AsyncStorage.setItem(key, JSON.stringify(allergenIds));
    return { success: true };
  } catch (error) {
    console.error('Error saving allergen preferences:', error);
    return { success: false, error };
  }
}

/**
 * Load user's allergen preferences from AsyncStorage
 * @param {string} userEmail - User's email
 * @returns {string[]} - Array of selected allergen IDs
 */
export async function loadUserAllergens(userEmail) {
  try {
    const key = `allergyPreferences_${userEmail}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading allergen preferences:', error);
    return [];
  }
}

/**
 * Format allergen detection result for display
 * @param {Object} detectionResult - Result from performAllergenCheck
 * @returns {string} - Formatted message
 */
export function formatAllergenWarning(detectionResult) {
  if (!detectionResult.hasAllergen && detectionResult.warnings.length === 0) {
    return null;
  }

  if (detectionResult.warnings.length > 0) {
    return detectionResult.warnings[0].message;
  }

  const allergenNames = detectionResult.detectedAllergens
    .map(d => d.allergen.name)
    .join(', ');

  return `⚠️ Обнаружен аллерген: ${allergenNames}`;
}
