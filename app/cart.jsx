import { View, Text, ScrollView, Image, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { databases, ID } from "../services/appwriteConfig";
import { useAuth } from "../contexts/AuthContext";

const DATABASE_ID = "691f9cdb00050d25863b";
const ORDERS_COLLECTION_ID = "order";

export default function Cart() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { cartItems, updateQuantity, clearCart, getCartTotal } = useCart();

    const [orderStatus] = useState("preparing");

    const subtotal = getCartTotal();
    const deliveryFee = 3.00;
    const total = subtotal + deliveryFee;

    const statusSteps = [
        { key: "preparing", label: "Preparing", icon: "👨‍🍳", active: true },
        { key: "on-the-way", label: "On the Way", icon: "🚗", active: orderStatus !== "preparing" },
        { key: "delivered", label: "Delivered", icon: "✅", active: orderStatus === "delivered" },
    ];

    // Save cart as order in Appwrite
    const handleCheckout = async () => {
        try {
            if (!user) {
                Alert.alert("Error", "You must be logged in to place an order");
                return;
            }

            if (cartItems.length === 0) {
                Alert.alert("Cart is empty", "Add items to your cart before checkout.");
                return;
            }

            console.log("Creating order for user:", user.$id);

            const orderDocument = {
                userId: user.$id,
                status: "preparing",
                total: total,
                items: JSON.stringify(cartItems.map(item => ({
                    id: item.coffeeId,
                    name: item.name,
                    price: typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price,
                    quantity: item.quantity,
                    type: item.type,
                    size: item.size,
                }))),
                address: JSON.stringify({
                    label: "Home",
                    street: "123 Main St, Apt 4B",
                    city: "New York",
                    zip: "10001"
                }),
            };

            const result = await databases.createDocument(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                ID.unique(),
                orderDocument
            );

            console.log("Order created:", result);

            Alert.alert("Success", "Your order has been placed!");
            clearCart(); // Clear cart after successful order
            router.push("/(tabs)/profile"); // Navigate to profile to see order history
        } catch (error) {
            console.error("Checkout error:", error);

            if (error.code === 401) {
                Alert.alert("Permission Error", "Please check collection permissions in Appwrite.");
            } else {
                Alert.alert("Error", error.message || "Failed to place order. Please try again.");
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
                </Pressable>
                <Text style={[styles.title, { color: theme.text }]}>Your Cart</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Order Status Tracker */}
                <View style={[styles.statusContainer, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Status</Text>
                    <View style={styles.statusTracker}>
                        {statusSteps.map((step, index) => (
                            <View key={step.key} style={styles.statusStep}>
                                <View style={[styles.statusIcon, step.active && { backgroundColor: theme.primary }]}>
                                    <Text style={styles.statusEmoji}>{step.icon}</Text>
                                </View>
                                <Text style={[styles.statusLabel, step.active && { color: theme.primary }]}>{step.label}</Text>
                                {index < statusSteps.length - 1 && (
                                    <View style={[styles.statusLine, step.active && { backgroundColor: theme.primary }]} />
                                )}
                            </View>
                        ))}
                    </View>
                    <Text style={[styles.estimatedTime, { color: theme.textSecondary }]}>Estimated delivery: 25-30 min</Text>
                </View>

                {/* Cart Items */}
                <View style={[styles.itemsContainer, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Items</Text>
                    {cartItems.length === 0 ? (
                        <Text style={[styles.emptyCart, { color: theme.textSecondary }]}>Your cart is empty</Text>
                    ) : (
                        cartItems.map(item => {
                            const price = typeof item.price === 'string' 
                                ? parseFloat(item.price.replace('$', '')) 
                                : item.price;
                            
                            return (
                                <View key={item.id} style={[styles.cartItem, { borderBottomColor: theme.border }]}>
                                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                                    <View style={styles.itemDetails}>
                                        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                                        <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>
                                            {item.type} • {item.size}
                                        </Text>
                                        <Text style={[styles.itemPrice, { color: theme.textSecondary }]}>
                                            ${price.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.quantityControls}>
                                        <Pressable 
                                            onPress={() => updateQuantity(item.id, -1)} 
                                            style={[styles.quantityButton, { backgroundColor: theme.primary }]}
                                        >
                                            <Text style={styles.quantityButtonText}>−</Text>
                                        </Pressable>
                                        <Text style={[styles.quantity, { color: theme.text }]}>{item.quantity}</Text>
                                        <Pressable 
                                            onPress={() => updateQuantity(item.id, 1)} 
                                            style={[styles.quantityButton, { backgroundColor: theme.primary }]}
                                        >
                                            <Text style={styles.quantityButtonText}>+</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Delivery Info */}
                <View style={[styles.deliveryContainer, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
                    <View style={styles.addressCard}>
                        <Text style={styles.addressIcon}>📍</Text>
                        <View>
                            <Text style={[styles.addressTitle, { color: theme.text }]}>Home</Text>
                            <Text style={[styles.addressText, { color: theme.textSecondary }]}>123 Main St, Apt 4B</Text>
                            <Text style={[styles.addressText, { color: theme.textSecondary }]}>New York, NY 10001</Text>
                        </View>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={[styles.summaryContainer, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
                        <Text style={[styles.summaryValue, { color: theme.text }]}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
                        <Text style={[styles.summaryValue, { color: theme.text }]}>${deliveryFee.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.border }]}>
                        <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: theme.primary }]}>${total.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Checkout Button */}
            {cartItems.length > 0 && (
                <View style={[styles.checkoutContainer, { backgroundColor: theme.cardBackground, borderTopColor: theme.border }]}>
                    <Pressable style={[styles.checkoutButton, { backgroundColor: theme.primary }]} onPress={handleCheckout}>
                        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    </Pressable>
                </View>
            )}
        </View>
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
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 5,
    },
    backText: {
        fontSize: 16,
        fontWeight: "600",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    content: {
        flex: 1,
    },
    statusContainer: {
        margin: 15,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 15,
    },
    statusTracker: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    statusStep: {
        flex: 1,
        alignItems: "center",
        position: "relative",
    },
    statusIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statusEmoji: {
        fontSize: 24,
    },
    statusLabel: {
        fontSize: 12,
        color: "#6c757d",
        textAlign: "center",
    },
    statusLine: {
        position: "absolute",
        top: 25,
        left: "50%",
        width: "100%",
        height: 2,
        backgroundColor: "#e0e0e0",
        zIndex: -1,
    },
    estimatedTime: {
        textAlign: "center",
        fontSize: 14,
    },
    itemsContainer: {
        margin: 15,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    emptyCart: {
        textAlign: "center",
        fontSize: 16,
        paddingVertical: 20,
    },
    cartItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 12,
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 14,
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    quantityButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    quantityButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    quantity: {
        fontSize: 16,
        fontWeight: "600",
        minWidth: 20,
        textAlign: "center",
    },
    deliveryContainer: {
        margin: 15,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    addressCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    addressIcon: {
        fontSize: 24,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        lineHeight: 20,
    },
    summaryContainer: {
        margin: 15,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: "600",
    },
    totalRow: {
        borderTopWidth: 1,
        paddingTop: 12,
        marginTop: 5,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "700",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    checkoutContainer: {
        padding: 20,
        borderTopWidth: 1,
    },
    checkoutButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    checkoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});