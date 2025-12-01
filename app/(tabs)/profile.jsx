import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, TextInput, 
         Alert, Image, Platform, ActionSheetIOS ,} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth, uploadProfilePhoto } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { databases, Query } from "../../services/appwriteConfig";
import { SafeAreaView } from "react-native-safe-area-context";

const DATABASE_ID = "691f9cdb00050d25863b";
const ORDERS_COLLECTION_ID = "order";

export default function Profile() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();

    const [profileImage, setProfileImage] = useState(user?.photo || null);
    const [modalVisible, setModalVisible] = useState(false);
    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const [address, setAddress] = useState({
        label: "Home",
        street: "123 Main St",
        city: "New York",
        zip: "10001",
    });
    const [tempAddress, setTempAddress] = useState(address);
    // -------------------- IMAGE PICKER --------------------
    const pickFromGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return Alert.alert("Permission denied", "Gallery access is required");

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            const upload = await updateProfilePicture(uri);
            if (upload.success) setProfileImage(upload.url);
        }
    };

    const pickFromCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return Alert.alert("Permission denied", "Camera access is required");

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            const upload = await updateProfilePicture(uri);
            if (upload.success) setProfileImage(upload.url);
        }
    };

    const openImageOptions = () => {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ["Cancel", "Take Photo", "Choose from Gallery"], cancelButtonIndex: 0 },
                (buttonIndex) => {
                    if (buttonIndex === 1) pickFromCamera();
                    if (buttonIndex === 2) pickFromGallery();
                }
            );
        } else {
            Alert.alert("Change Profile Picture", "Select an option", [
                { text: "Camera", onPress: pickFromCamera },
                { text: "Gallery", onPress: pickFromGallery },
                { text: "Cancel", style: "cancel" }
            ]);
        }
    };

    const updateProfilePicture = async (uri) => {
        const result = await uploadProfilePhoto(uri);
        if (!result.success) {
            Alert.alert("Error", result.error);
            return { success: false };
        }
        return result;
    };

    // -------------------- LOGOUT --------------------
    const handleLogout = () => {
        logout();
        router.replace("/auth");
    };

    // -------------------- LOCATION --------------------
    const handleUseCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return Alert.alert("Permission Denied", "Location permission required");

            const location = await Location.getCurrentPositionAsync({});
            const coords = `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`;
            setTempAddress(prev => ({ ...prev, street: coords }));
            Alert.alert("Location captured", "Latitude & longitude saved");
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to get location");
        }
    };

    // -------------------- ORDER HISTORY --------------------
    const openOrderHistory = async () => {
        try {
            setOrderModalVisible(true);
            setLoadingOrders(true);
            if (!user) return Alert.alert("Error", "User not logged in");

            const response = await databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                Query.equal("userId", user.$id),
                Query.orderDesc("$createdAt")
            ]);

            const formattedOrders = response.documents.map(doc => ({
                ...doc,
                items: typeof doc.items === "string" ? JSON.parse(doc.items) : doc.items,
                address: typeof doc.address === "string" ? JSON.parse(doc.address) : doc.address
            }));
            setOrders(formattedOrders);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", error.message || "Failed to fetch order history");
        } finally {
            setLoadingOrders(false);
        }
    };

    const profileOptions = [
        { id: 1, title: "Order History", icon: "📦", action: openOrderHistory },
        { id: 2, title: "Payment Methods", icon: "💳", route: "/payment" },
        { id: 3, title: "Delivery Addresses", icon: "📍", route: "/addresses" },
        { id: 4, title: "Notifications", icon: "🔔", route: "/notifications" },
        { id: 5, title: "Settings", icon: "⚙️", route: "/settings" },
        { id: 6, title: "Help & Support", icon: "❓", route: "/support" },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        {/* <View style={[styles.container, { backgroundColor: theme.background }]}> */}
            <ScrollView>
                {/* Profile Header */}
                <View style={[styles.header, { backgroundColor: theme.primary }]}>
                    <Pressable style={styles.avatarContainer} onPress={openImageOptions}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImage} resizeMode="cover"/>
                        ) : (
                            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
                        )}
                    </Pressable>

                    <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
                    <Text style={styles.userEmail}>{user?.email || "guest@example.com"}</Text>

                    <Pressable style={[styles.addAddressButton, { backgroundColor: "#fff" }]} onPress={() => { setTempAddress(address); setModalVisible(true); }}>
                        <Text style={[styles.addAddressText, { color: theme.primary }]}>Add / Edit Delivery Address</Text>
                    </Pressable>

                    <Text style={styles.currentAddress}>
                        Current: {address. wlabel} - {address.street}, {address.city}, {address.zip}
                    </Text>
                </View>

                {/* Profile Options */}
                <View style={styles.optionsContainer}>
                    {profileOptions.map(option => (
                        <Pressable
                            key={option.id}
                            style={[styles.optionCard, { backgroundColor: theme.cardBackground }]}
                            onPress={() => option.action ? option.action() : router.push(option.route)}
                        >
                            <Text style={styles.optionIcon}>{option.icon}</Text>
                            <Text style={[styles.optionTitle, { color: theme.text }]}>{option.title}</Text>
                            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
                        </Pressable>
                    ))}
                </View>

                {/* Logout */}
                <Pressable style={[styles.logoutButton, { backgroundColor: theme.danger }]} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </Pressable>
            </ScrollView>

            {/* Address Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Delivery Address</Text>
                        {["label", "street", "city", "zip"].map(field => (
                            <TextInput
                                key={field}
                                style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.inputBackground }]}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                placeholderTextColor={theme.textSecondary}
                                value={tempAddress[field]}
                                onChangeText={text => setTempAddress(prev => ({ ...prev, [field]: text }))}
                                keyboardType={field === "zip" ? "numeric" : "default"}
                            />
                        ))}
                        <Pressable style={[styles.currentLocationButton, { backgroundColor: theme.primary }]} onPress={handleUseCurrentLocation}>
                            <Text style={styles.addAddressText}>Use Current Location</Text>
                        </Pressable>

                        <View style={styles.modalButtons}>
                            <Pressable style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={() => { setAddress(tempAddress); setModalVisible(false); Alert.alert("Success", "Address saved!"); }}>
                                <Text style={styles.addAddressText}>Save</Text>
                            </Pressable>
                            <Pressable style={[styles.cancelButton, { borderColor: theme.border }]} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.addAddressText, { color: theme.text }]}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Order History Modal */}
            <Modal visible={orderModalVisible} animationType="slide" transparent={true} onRequestClose={() => setOrderModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, height: "80%" }]}>
                        <Pressable onPress={() => setOrderModalVisible(false)} style={{ marginBottom: 10 }}>
                            <Text style={{ color: theme.primary, fontWeight: "700" }}>← Back</Text>
                        </Pressable>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Order History</Text>
                        <ScrollView style={{ marginTop: 10 }}>
                            {loadingOrders ? <Text style={{ color: theme.textSecondary }}>Loading...</Text> :
                                orders.length === 0 ? <Text style={{ color: theme.textSecondary, textAlign: "center" }}>No orders yet.</Text> :
                                    orders.map(order => (
                                        <View key={order.$id} style={[styles.orderCard, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}>
                                            <Text style={{ color: theme.text, fontWeight: "700", marginBottom: 5 }}>Order #{order.$id.substring(0, 8)}</Text>
                                            <Text style={{ color: theme.textSecondary, marginBottom: 3 }}>Status: <Text style={{ color: theme.primary, fontWeight: "600" }}>{order.status}</Text></Text>
                                            <Text style={{ color: theme.text, fontWeight: "600", marginBottom: 3 }}>Total: ${order.total?.toFixed(2) || "0.00"}</Text>
                                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{new Date(order.$createdAt).toLocaleString()}</Text>
                                        </View>
                                    ))
                            }
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        {/* </View> */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 30, paddingBottom: 30, alignItems: "center" },
    avatarContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", marginBottom: 15, overflow: "hidden" },
    avatarImage: { width: "100%", height: "100%" },
    avatarText: { fontSize: 32, fontWeight: "700", color: "#4CAF50" },
    userName: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 5 },
    userEmail: { fontSize: 14, color: "#e8f5e9" },
    addAddressButton: { padding: 10, borderRadius: 8, marginTop: 10 },
    addAddressText: { fontWeight: "600", color: "#fff", textAlign: "center" },
    currentAddress: { marginTop: 5, fontSize: 12, color: "#e8f5e9" },
    optionsContainer: { padding: 20 },
    optionCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, marginBottom: 12 },
    optionIcon: { fontSize: 24, marginRight: 15 },
    optionTitle: { flex: 1, fontSize: 16, fontWeight: "600" },
    arrow: { fontSize: 24 },
    logoutButton: { margin: 20, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 10, marginBottom: 40 },
    logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { width: "90%", padding: 20, borderRadius: 12, maxHeight: "80%" },
    sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10 },
    currentLocationButton: { padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 15 },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    saveButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center", marginRight: 5 },
    cancelButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center", borderWidth: 1, marginLeft: 5 },
    orderCard: { padding: 15, marginBottom: 12, borderRadius: 8 },
});
