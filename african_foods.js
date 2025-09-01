/**
 * 🍽️ Traditional African & Ethiopian Foods Database
 * SmartEats Cultural Food Integration - SDG 2 & 3
 * Supporting food diversity and nutrition across Africa
 */

// Traditional Ethiopian Foods
const ethiopianFoods = {
    // Main Dishes
    injera: {
        name: "Injera (ኢንጀራ)",
        description: "Traditional Ethiopian sourdough flatbread made from teff flour",
        category: "grains",
        region: "Ethiopia",
        calories: 180,
        protein: 6.8,
        carbs: 36.5,
        fat: 1.2,
        fiber: 4.8,
        vitamins: ["B1", "B6", "Iron", "Calcium", "Magnesium"],
        benefits: [
            "Rich in probiotics from fermentation",
            "High in iron and calcium", 
            "Gluten-free ancient grain",
            "Supports digestive health"
        ],
        culturalSignificance: "Sacred bread that brings families together, eaten with every meal",
        preparationTime: "3-4 days (fermentation)",
        servingSize: "1 large injera (50g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23CD853F'/%3E%3Ccircle cx='150' cy='100' r='80' fill='%23DEB887' stroke='%23A0522D' stroke-width='2'/%3E%3Ctext x='150' y='105' font-family='Arial' font-size='14' fill='%23654321' text-anchor='middle'%3EInjera%3C/text%3E%3Ctext x='150' y='125' font-family='Arial' font-size='12' fill='%23654321' text-anchor='middle'%3E(ኢንጀራ)%3C/text%3E%3C/svg%3E"
    },

    doro_wat: {
        name: "Doro Wat (ዶሮ ወጥ)",
        description: "Ethiopia's national dish - spicy chicken stew with berbere spice",
        category: "protein",
        region: "Ethiopia",
        calories: 420,
        protein: 35.2,
        carbs: 8.5,
        fat: 28.4,
        fiber: 2.1,
        vitamins: ["B12", "Iron", "Zinc", "Vitamin A"],
        benefits: [
            "High-quality complete protein",
            "Rich in berbere antioxidants",
            "Supports immune system",
            "Traditional healing spices"
        ],
        culturalSignificance: "Ceremonial dish for holidays and special occasions",
        preparationTime: "2-3 hours",
        servingSize: "1 serving (200g)",
        spiceLevel: "Hot 🌶️🌶️🌶️",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%238B0000'/%3E%3Ccircle cx='150' cy='100' r='70' fill='%23DC143C'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3EDoro Wat%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3E🍗 ዶሮ ወጥ 🌶️%3C/text%3E%3C/svg%3E"
    },

    shiro: {
        name: "Shiro (ሽሮ)",
        description: "Nutritious chickpea or lentil flour stew, often eaten during fasting",
        category: "legumes",
        region: "Ethiopia",
        calories: 280,
        protein: 18.5,
        carbs: 32.8,
        fat: 8.2,
        fiber: 12.4,
        vitamins: ["Folate", "Iron", "Magnesium", "Protein"],
        benefits: [
            "Plant-based complete protein",
            "High fiber for digestion", 
            "Rich in folate",
            "Suitable for fasting periods"
        ],
        culturalSignificance: "Essential fasting food supporting Orthodox traditions",
        preparationTime: "30-45 minutes",
        servingSize: "1 cup (150g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23DEB887'/%3E%3Ccircle cx='150' cy='100' r='75' fill='%23CD853F'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='18' fill='%23654321' text-anchor='middle'%3EShiro%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='%23654321' text-anchor='middle'%3E(ሽሮ) 🥜%3C/text%3E%3C/svg%3E"
    },

    kitfo: {
        name: "Kitfo (ክትፎ)",
        description: "Ethiopian steak tartare with mitmita spice and clarified butter",
        category: "protein",
        region: "Ethiopia", 
        calories: 380,
        protein: 26.8,
        carbs: 2.1,
        fat: 29.5,
        fiber: 0.5,
        vitamins: ["B12", "Iron", "Zinc", "Vitamin A"],
        benefits: [
            "Very high in iron",
            "Rich B-complex vitamins",
            "High bioavailable protein",
            "Traditional energy food"
        ],
        culturalSignificance: "Delicacy served at special celebrations",
        preparationTime: "15 minutes",
        servingSize: "100g serving",
        dietaryNote: "Raw meat - ensure high quality source",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23800000'/%3E%3Ccircle cx='150' cy='100' r='70' fill='%23A0522D'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3EKitfo%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3E(ክትፎ) 🥩%3C/text%3E%3C/svg%3E"
    },

    tibs: {
        name: "Tibs (ጥብስ)",
        description: "Sautéed meat with vegetables and Ethiopian spices",
        category: "protein",
        region: "Ethiopia",
        calories: 320,
        protein: 28.4,
        carbs: 6.8,
        fat: 20.2,
        fiber: 2.1,
        vitamins: ["B12", "Iron", "Vitamin C", "Beta-carotene"],
        benefits: [
            "Balanced protein and vegetables",
            "Rich in antioxidants from spices",
            "Good source of iron",
            "Moderate calorie meal"
        ],
        culturalSignificance: "Popular everyday meal across Ethiopia",
        preparationTime: "25-30 minutes",
        servingSize: "1 serving (180g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23228B22'/%3E%3Ccircle cx='150' cy='100' r='70' fill='%2332CD32'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3ETibs%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3E(ጥብስ) 🥘%3C/text%3E%3C/svg%3E"
    }
};

// Traditional African Foods from Various Regions
const africanFoods = {
    // West African
    jollof_rice: {
        name: "Jollof Rice",
        description: "Iconic West African rice dish cooked in tomato-based sauce with spices",
        category: "grains",
        region: "West Africa (Nigeria, Ghana, Senegal)",
        calories: 290,
        protein: 8.2,
        carbs: 52.4,
        fat: 6.8,
        fiber: 2.8,
        vitamins: ["Vitamin C", "Beta-carotene", "B-vitamins"],
        benefits: [
            "Complex carbohydrates for energy",
            "Lycopene from tomatoes",
            "Balanced macro nutrients",
            "Culturally unifying dish"
        ],
        culturalSignificance: "Symbol of West African unity and celebration",
        preparationTime: "45-60 minutes",
        servingSize: "1 cup (200g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23FF4500'/%3E%3Ccircle cx='150' cy='100' r='75' fill='%23FF6347'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3EJollof Rice%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3E🍚 West Africa 🌶️%3C/text%3E%3C/svg%3E"
    },

    fufu: {
        name: "Fufu",
        description: "Starchy staple made from cassava, yam, or plantain flour",
        category: "grains",
        region: "Central & West Africa",
        calories: 320,
        protein: 2.8,
        carbs: 78.5,
        fat: 0.8,
        fiber: 4.2,
        vitamins: ["Vitamin C", "Potassium", "Magnesium"],
        benefits: [
            "Sustained energy release",
            "Gluten-free carbohydrate",
            "Rich in resistant starch",
            "Probiotic when fermented"
        ],
        culturalSignificance: "Community food that brings families together",
        preparationTime: "30-45 minutes",
        servingSize: "1 ball (100g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23F5F5DC'/%3E%3Ccircle cx='150' cy='100' r='70' fill='%23FFFACD'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='18' fill='%23654321' text-anchor='middle'%3EFufu%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='%23654321' text-anchor='middle'%3E🥔 Central Africa%3C/text%3E%3C/svg%3E"
    },

    ugali: {
        name: "Ugali/Posho",
        description: "Cornmeal staple food popular across East Africa",
        category: "grains", 
        region: "East Africa (Kenya, Tanzania, Uganda)",
        calories: 340,
        protein: 8.8,
        carbs: 72.6,
        fat: 3.2,
        fiber: 7.4,
        vitamins: ["B-vitamins", "Magnesium", "Phosphorus"],
        benefits: [
            "Affordable nutrition source",
            "High in complex carbs",
            "Good fiber content",
            "Sustained energy"
        ],
        culturalSignificance: "Daily bread of East Africa, eaten with every meal",
        preparationTime: "20 minutes",
        servingSize: "1 serving (100g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23FFD700'/%3E%3Ccircle cx='150' cy='100' r='70' fill='%23FFF8DC'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='18' fill='%23654321' text-anchor='middle'%3EUgali%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='%23654321' text-anchor='middle'%3E🌽 East Africa%3C/text%3E%3C/svg%3E"
    },

    bobotie: {
        name: "Bobotie",
        description: "South African spiced meat casserole with egg topping",
        category: "protein",
        region: "South Africa",
        calories: 385,
        protein: 22.4,
        carbs: 18.6,
        fat: 24.8,
        fiber: 2.4,
        vitamins: ["B12", "Iron", "Vitamin A", "Protein"],
        benefits: [
            "High quality protein",
            "Rich in iron and B-vitamins",
            "Includes curry spices with anti-inflammatory properties",
            "Balanced comfort food"
        ],
        culturalSignificance: "National dish representing South African diversity",
        preparationTime: "1 hour",
        servingSize: "1 serving (200g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23DAA520'/%3E%3Ccircle cx='150' cy='100' r='75' fill='%23FFD700'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='18' fill='%23654321' text-anchor='middle'%3EBobotie%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='%23654321' text-anchor='middle'%3E🍖 South Africa%3C/text%3E%3C/svg%3E"
    },

    couscous: {
        name: "Couscous",
        description: "North African pasta made from semolina wheat",
        category: "grains",
        region: "North Africa (Morocco, Algeria, Tunisia)",
        calories: 315,
        protein: 10.8,
        carbs: 65.2,
        fat: 1.2,
        fiber: 3.8,
        vitamins: ["B-vitamins", "Iron", "Magnesium"],
        benefits: [
            "Quick-cooking grain alternative",
            "Good source of protein",
            "Low in fat",
            "Versatile base for vegetables"
        ],
        culturalSignificance: "UNESCO cultural heritage food of North Africa",
        preparationTime: "10 minutes",
        servingSize: "1 cup cooked (185g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23F4A460'/%3E%3Ccircle cx='150' cy='100' r='70' fill='%23DEB887'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='18' fill='%23654321' text-anchor='middle'%3ECouscous%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='%23654321' text-anchor='middle'%3E🌾 North Africa%3C/text%3E%3C/svg%3E"
    },

    // Traditional Vegetables & Legumes
    sukuma_wiki: {
        name: "Sukuma Wiki",
        description: "East African collard greens cooked with onions and spices",
        category: "vegetables",
        region: "East Africa",
        calories: 45,
        protein: 4.2,
        carbs: 8.8,
        fat: 0.8,
        fiber: 4.2,
        vitamins: ["Vitamin K", "Vitamin C", "Folate", "Beta-carotene"],
        benefits: [
            "Very high in vitamin K",
            "Rich in antioxidants",
            "Low calorie, high nutrition",
            "Supports bone health"
        ],
        culturalSignificance: "Means 'stretch the week' - affordable nutrition",
        preparationTime: "15 minutes",
        servingSize: "1 cup (100g)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23228B22'/%3E%3Ccircle cx='150' cy='100' r='75' fill='%2332CD32'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3ESukuma Wiki%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3E🥬 East Africa%3C/text%3E%3C/svg%3E"
    }
};

// Nutritious African Beverages
const africanBeverages = {
    tej: {
        name: "Tej (ጠጅ)",
        description: "Ethiopian honey wine - traditional fermented beverage",
        category: "beverages",
        region: "Ethiopia",
        calories: 180,
        protein: 0.5,
        carbs: 22.4,
        fat: 0,
        fiber: 0,
        vitamins: ["Antioxidants", "B-vitamins"],
        benefits: [
            "Contains beneficial probiotics",
            "Honey provides antioxidants", 
            "Cultural and ceremonial significance",
            "Moderate alcohol content"
        ],
        culturalSignificance: "Sacred drink for ceremonies and celebrations",
        servingSize: "1 glass (150ml)",
        alcoholContent: "7-11% ABV",
        note: "For adults only",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23FFD700'/%3E%3Ccircle cx='150' cy='100' r='70' fill='%23FFA500'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='20' fill='white' text-anchor='middle'%3ETej%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3E🍯 (ጠጅ) 🍷%3C/text%3E%3C/svg%3E"
    },

    bissap: {
        name: "Bissap/Hibiscus Tea",
        description: "Refreshing hibiscus flower tea popular across Africa",
        category: "beverages",
        region: "West Africa",
        calories: 15,
        protein: 0.2,
        carbs: 3.8,
        fat: 0,
        fiber: 0.2,
        vitamins: ["Vitamin C", "Antioxidants"],
        benefits: [
            "Very high in antioxidants",
            "May help lower blood pressure",
            "Natural source of vitamin C",
            "Caffeine-free herbal tea"
        ],
        culturalSignificance: "Daily refreshing drink, served hot or cold",
        preparationTime: "10 minutes",
        servingSize: "1 cup (250ml)",
        image: "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23DC143C'/%3E%3Ccircle cx='150' cy='100' r='70' fill='%23B22222'/%3E%3Ctext x='150' y='95' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3EBissap%3C/text%3E%3Ctext x='150' y='115' font-family='Arial' font-size='14' fill='white' text-anchor='middle'%3E🌺 Hibiscus Tea%3C/text%3E%3C/svg%3E"
    }
};

// Spice & Seasoning Blends
const africanSpices = {
    berbere: {
        name: "Berbere (በርበሬ)",
        description: "Ethiopian spice blend with chili peppers, garlic, ginger, and aromatic spices",
        category: "spices",
        region: "Ethiopia",
        benefits: [
            "Rich in antioxidants",
            "Anti-inflammatory properties",
            "Metabolism boosting",
            "Supports immune system"
        ],
        ingredients: ["Chili peppers", "Paprika", "Garlic", "Ginger", "Cardamom", "Coriander", "Fenugreek"],
        culturalSignificance: "Soul of Ethiopian cuisine",
        spiceLevel: "Hot 🌶️🌶️🌶️"
    },

    harissa: {
        name: "Harissa",
        description: "North African chili paste with garlic, spices, and olive oil",
        category: "spices", 
        region: "North Africa (Tunisia, Morocco, Algeria)",
        benefits: [
            "High in capsaicin",
            "Antioxidant properties",
            "May boost metabolism",
            "Contains healthy olive oil"
        ],
        ingredients: ["Red chilies", "Garlic", "Cumin", "Coriander", "Caraway", "Olive oil"],
        culturalSignificance: "Essential condiment in North African cooking",
        spiceLevel: "Medium-Hot 🌶️🌶️"
    }
};

// Combined database for easy access
const africanFoodDatabase = {
    ethiopian: ethiopianFoods,
    african: africanFoods,
    beverages: africanBeverages,
    spices: africanSpices
};

// AI Assistant responses for African foods
const africanFoodResponses = {
    'injera': "🍞 **INJERA - ETHIOPIAN SUPERFOOD:**\n\n• **Ancient Grain**: Made from teff, one of the world's oldest grains\n• **Probiotics**: Fermentation creates beneficial bacteria for gut health\n• **Gluten-Free**: Perfect for celiac or gluten sensitivity\n• **Complete Nutrition**: High iron, calcium, protein, and fiber\n• **Cultural Heritage**: Sacred bread that unites Ethiopian families\n\n*Try making injera at home - it takes 3-4 days to ferment properly!*",

    'doro wat': "🍗 **DORO WAT - ETHIOPIA'S NATIONAL DISH:**\n\n• **Protein Power**: 35g high-quality protein per serving\n• **Berbere Benefits**: Anti-inflammatory spices boost immunity\n• **B12 Rich**: Essential vitamin for nerve function\n• **Iron Source**: Supports healthy blood formation\n• **Cultural Pride**: Served at holidays and celebrations\n\n*Best enjoyed with injera and eaten with hands in Ethiopian tradition!*",

    'shiro': "🥜 **SHIRO - PLANT-BASED PROTEIN:**\n\n• **Fasting Food**: Perfect for Ethiopian Orthodox fasting periods\n• **Complete Protein**: 18.5g plant-based protein per cup\n• **High Fiber**: 12.4g supports digestive health\n• **Folate Rich**: Essential for pregnant women\n• **Budget Friendly**: Nutritious and affordable meal\n\n*Mix with berbere spice for authentic Ethiopian flavor!*",

    'jollof rice': "🍚 **JOLLOF RICE - WEST AFRICAN UNITY:**\n\n• **Cultural Bridge**: Unites Nigeria, Ghana, and Senegal\n• **Balanced Meal**: Perfect carbs, protein, and vegetables\n• **Lycopene Power**: Tomatoes provide antioxidant protection\n• **Energy Source**: Complex carbs for sustained energy\n• **Celebration Food**: Center of West African gatherings\n\n*Each country has their unique jollof recipe - all delicious!*",

    'fufu': "🥔 **FUFU - AFRICAN ENERGY SOURCE:**\n\n• **Sustained Energy**: Complex carbs provide lasting fuel\n• **Gluten-Free**: Made from cassava, yam, or plantain\n• **Resistant Starch**: Feeds beneficial gut bacteria\n• **Community Food**: Eaten from shared bowl with family\n• **Versatile**: Pairs with any soup or stew\n\n*Traditionally eaten with hands - it's part of the cultural experience!*"
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        africanFoodDatabase,
        africanFoodResponses,
        ethiopianFoods,
        africanFoods,
        africanBeverages,
        africanSpices
    };
}

// For browser usage
window.africanFoodDatabase = africanFoodDatabase;
window.africanFoodResponses = africanFoodResponses;
