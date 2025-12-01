import { View, Text, Image, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useCart } from "../../contexts/CartContext";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/Ionicons';

const coffeeDetails = [
    {
        id: 1,
        name: "Latte",
        price: 2.55,
        description: "A delicious blend of espresso and steamed milk.",
        image: "https://www.brighteyedbaker.com/wp-content/uploads/2024/03/Spanish-Iced-Latte.jpg",
        ingredients: ["Espresso", "Steamed Milk", "Milk Foam"],
        rating: 4.5,
    },
    {
        id: 2,
        name: "Americano",
        price: 2.00,
        description: "Espresso diluted with hot water for a rich flavor.",
        image: "https://images.ctfassets.net/v601h1fyjgba/1vlXSpBbgUo9yLzh71tnOT/a1afdbe54a383d064576b5e628035f04/Iced_Americano.jpg",
        ingredients: ["Espresso", "Hot Water"],
        rating: 4.3,
    },
    {
        id: 3,
        name: "Cappuccino",
        price: 2.65,
        description: "Espresso topped with frothy steamed milk.",
        image: "https://130529051.cdn6.editmysite.com/uploads/1/3/0/5/130529051/V3O3FIVEAP2WHOYTSKFLMVCN.jpeg",
        ingredients: ["Espresso", "Steamed Milk", "Milk Foam"],
        rating: 4.7,
    },
    {
        id: 4,
        name: "Espresso",
        price: 2.00,
        description: "Strong and bold coffee served in a small cup.",
        image: "https://images.squarespace-cdn.com/content/v1/5e5be427805a63534f1344ad/530ba631-0ae2-43f4-bf30-b4cd1113361c/Brewing-With-Dani-home-barista-online-course-iced-espresso-drink-iced-shaken-espresso.jpeg",
        ingredients: ["Espresso"],
        rating: 4.8,
    },
    {
        id: 5,
        name: "Mocha",
        price: 2.55,
        description: "A chocolate-flavored variant of a latte.",
        image: "https://vibrantlygfree.com/wp-content/uploads/2023/07/iced-mocha-1.jpg",
        ingredients: ["Espresso", "Steamed Milk", "Chocolate Syrup", "Whipped Cream"],
        rating: 4.6,
    },
];

export default function CoffeeDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { theme, isDarkMode } = useTheme();
    const { addToCart } = useCart();

    const [type, setType] = useState("Cold");
    const [size, setSize] = useState("M");
    const [quantity, setQuantity] = useState(1);

    // Find the coffee by id
    const coffee = coffeeDetails.find(item => item.id === parseInt(id));

    if (!coffee) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>Coffee not found</Text>
            </View>
        );
    }

    const handleAddToCart = () => {
        const item = {
            id: coffee.id,
            name: coffee.name,
            price: coffee.price,
            image: coffee.image,
        };

        for (let i = 0; i < quantity; i++) {
            addToCart(item, type, size);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={theme.text} />
                    </Pressable>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Details</Text>
                    <Pressable onPress={() => router.push("/cart")} style={styles.cartButton}>
                        <Icon name="cart" size={24} color={theme.text} />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Coffee Image */}
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: coffee.image }} style={styles.coffeeImage} />
                        <View style={[styles.ratingBadge, { backgroundColor: theme.primary }]}>
                            <Icon name="star" size={16} color="#FFD700" />
                            <Text style={styles.ratingText}>{coffee.rating}</Text>
                        </View>
                    </View>

                    {/* Coffee Info */}
                    <View style={styles.infoContainer}>
                        <Text style={[styles.coffeeName, { color: theme.text }]}>{coffee.name}</Text>
                        <Text style={[styles.coffeePrice, { color: theme.primary }]}>
                            ${coffee.price.toFixed(2)}
                        </Text>
                        <Text style={[styles.coffeeDescription, { color: theme.textSecondary }]}>
                            {coffee.description}
                        </Text>

                        {/* Ingredients */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients</Text>
                            <View style={styles.ingredientsContainer}>
                                {coffee.ingredients.map((ingredient, index) => (
                                    <View key={index} style={[styles.ingredientChip, { backgroundColor: theme.cardBackground }]}>
                                        <Text style={[styles.ingredientText, { color: theme.text }]}>
                                            {ingredient}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Type Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Temperature</Text>
                            <View style={styles.optionRow}>
                                {["Hot", "Cold"].map((t) => (
                                    <Pressable
                                        key={t}
                                        onPress={() => setType(t)}
                                        style={[
                                            styles.optionButton,
                                            { borderColor: theme.border },
                                            type === t && { backgroundColor: theme.primary, borderColor: theme.primary }
                                        ]}
                                    >
                                        <Icon 
                                            name={t === "Hot" ? "flame" : "snow"} 
                                            size={20} 
                                            color={type === t ? "#fff" : theme.text} 
                                        />
                                        <Text
                                            style={[
                                                styles.optionText,
                                                { color: type === t ? "#fff" : theme.text }
                                            ]}
                                        >
                                            {t}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Size Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Size</Text>
                            <View style={styles.optionRow}>
                                {[
                                    { label: "S", desc: "Small" },
                                    { label: "M", desc: "Medium" },
                                    { label: "L", desc: "Large" }
                                ].map((s) => (
                                    <Pressable
                                        key={s.label}
                                        onPress={() => setSize(s.label)}
                                        style={[
                                            styles.sizeButton,
                                            { borderColor: theme.border },
                                            size === s.label && { backgroundColor: theme.primary, borderColor: theme.primary }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.sizeLabel,
                                                { color: size === s.label ? "#fff" : theme.text }
                                            ]}
                                        >
                                            {s.label}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.sizeDesc,
                                                { color: size === s.label ? "#fff" : theme.textSecondary }
                                            ]}
                                        >
                                            {s.desc}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Quantity Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quantity</Text>
                            <View style={styles.quantityContainer}>
                                <Pressable
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={[styles.quantityButton, { backgroundColor: theme.primary }]}
                                >
                                    <Icon name="remove" size={24} color="#fff" />
                                </Pressable>
                                <Text style={[styles.quantityText, { color: theme.text }]}>{quantity}</Text>
                                <Pressable
                                    onPress={() => setQuantity(quantity + 1)}
                                    style={[styles.quantityButton, { backgroundColor: theme.primary }]}
                                >
                                    <Icon name="add" size={24} color="#fff" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Add to Cart Button */}
                <View style={[styles.footer, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
                    <View>
                        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Price</Text>
                        <Text style={[styles.totalPrice, { color: theme.primary }]}>
                            ${(coffee.price * quantity).toFixed(2)}
                        </Text>
                    </View>
                    <Pressable
                        style={[styles.addToCartButton, { backgroundColor: theme.danger }]}
                        onPress={handleAddToCart}
                    >
                        <Icon name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    cartButton: {
        padding: 5,
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: 300,
    },
    coffeeImage: {
        width: "100%",
        height: "100%",
    },
    ratingBadge: {
        position: "absolute",
        top: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5,
    },
    ratingText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },
    infoContainer: {
        padding: 20,
    },
    coffeeName: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 8,
    },
    coffeePrice: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 15,
    },
    coffeeDescription: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    ingredientsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    ingredientChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    ingredientText: {
        fontSize: 14,
        fontWeight: "500",
    },
    optionRow: {
        flexDirection: "row",
        gap: 12,
    },
    optionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
    },
    optionText: {
        fontSize: 16,
        fontWeight: "600",
    },
    sizeButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    sizeLabel: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    sizeDesc: {
        fontSize: 12,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    quantityButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    quantityText: {
        fontSize: 24,
        fontWeight: "700",
        minWidth: 40,
        textAlign: "center",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 4,
    },
    totalLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: "700",
    },
    addToCartButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    addToCartText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    errorText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 50,
    },
});