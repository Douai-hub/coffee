import { View, Text, Pressable, StyleSheet, Switch, ScrollView, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Settings() {
    const router = useRouter();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { user, logout, updateProfile, changePassword } = useAuth();

    // Local states for profile updates
    const [name, setName] = useState(user?.name || "");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setName(user.name);
    }, [user]);

    const handleLogout = async () => {
        await logout();
        router.replace("/auth");
    };

    const handleUpdateProfile = async () => {
        if (!name.trim()) return Alert.alert("Error", "Name cannot be empty");

        setLoading(true);
        const result = await updateProfile(name.trim());
        setLoading(false);

        if (result.success) Alert.alert("Success", "Profile updated successfully");
        else Alert.alert("Error", result.error);
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) return Alert.alert("Error", "Please fill in both fields");
        if (newPassword.length < 8) return Alert.alert("Error", "New password must be at least 8 characters");

        setLoading(true);
        const result = await changePassword(oldPassword, newPassword);
        setLoading(false);

        if (result.success) {
            Alert.alert("Success", "Password changed successfully");
            setOldPassword("");
            setNewPassword("");
        } else Alert.alert("Error", result.error);
    };

    const settingsSections = [
        {
            title: "Appearance",
            items: [
                {
                    id: "dark-mode",
                    icon: isDarkMode ? "🌙" : "☀️",
                    label: "Dark Mode",
                    type: "toggle",
                    value: isDarkMode,
                    onToggle: toggleTheme,
                },
            ],
        },
        {
            title: "Account",
            items: [
                {
                    id: "profile",
                    icon: "👤",
                    label: "Edit Profile",
                    type: "custom", // custom input for name
                },
                {
                    id: "email",
                    icon: "📧",
                    label: "Email",
                    type: "info",
                    value: user?.email || "Not available",
                },
            ],
        },
        {
            title: "Security",
            items: [
                {
                    id: "change-password",
                    icon: "🔒",
                    label: "Change Password",
                    type: "custom-password", // custom password inputs
                },
            ],
        },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
                </Pressable>
                <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* User Info Card */}
            <View style={[styles.userCard, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.userName, { color: theme.text }]}>{user?.name || "Guest User"}</Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || "Not logged in"}</Text>
                </View>
            </View>

            {/* Settings Sections */}
            {settingsSections.map((section) => (
                <View key={section.title} style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{section.title}</Text>
                    <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground }]}>
                        {section.items.map((item, index) => {
                            if (item.type === "toggle") {
                                return (
                                    <View style={styles.settingItem} key={item.id}>
                                        <View style={styles.settingLeft}>
                                            <Text style={styles.settingIcon}>{item.icon}</Text>
                                            <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
                                        </View>
                                        <Switch
                                            value={item.value}
                                            onValueChange={item.onToggle}
                                            trackColor={{ false: theme.border, true: theme.primary }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                );
                            } else if (item.type === "info") {
                                return (
                                    <View style={styles.settingItem} key={item.id}>
                                        <View style={styles.settingLeft}>
                                            <Text style={styles.settingIcon}>{item.icon}</Text>
                                            <View>
                                                <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
                                                <Text style={[styles.infoValue, { color: theme.textSecondary }]}>{item.value}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            } else if (item.type === "custom") {
                                // Name input
                                return (
                                    <View key={item.id} style={styles.settingItemCustom}>
                                        <Text style={[styles.settingLabel, { color: theme.text }]}>Name:</Text>
                                        <TextInput
                                            value={name}
                                            onChangeText={setName}
                                            style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                                        />
                                        <Pressable style={styles.updateButton} onPress={handleUpdateProfile}>
                                            <Text style={styles.updateButtonText}>Update</Text>
                                        </Pressable>
                                    </View>
                                );
                            } else if (item.type === "custom-password") {
                                // Password inputs
                                return (
                                    <View key={item.id} style={styles.settingItemCustom}>
                                        <Text style={[styles.settingLabel, { color: theme.text }]}>Current Password:</Text>
                                        <TextInput
                                            value={oldPassword}
                                            onChangeText={setOldPassword}
                                            secureTextEntry
                                            style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                                        />
                                        <Text style={[styles.settingLabel, { color: theme.text }]}>New Password:</Text>
                                        <TextInput
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry
                                            style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                                        />
                                        <Pressable style={styles.updateButton} onPress={handleChangePassword}>
                                            <Text style={styles.updateButtonText}>Change</Text>
                                        </Pressable>
                                    </View>
                                );
                            }
                        })}
                    </View>
                </View>
            ))}

            {/* Logout Button */}
            <Pressable style={[styles.logoutButton, { backgroundColor: theme.danger }]} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    backButton: { padding: 5 },
    backText: { fontSize: 16, fontWeight: "600" },
    title: { fontSize: 20, fontWeight: "700" },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        margin: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    avatarText: { fontSize: 24, fontWeight: "700", color: "#fff" },
    userName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
    userEmail: { fontSize: 14 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 10 },
    sectionCard: { marginHorizontal: 20, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
    settingItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
    settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    settingIcon: { fontSize: 22, marginRight: 12 },
    settingLabel: { fontSize: 16, fontWeight: "500" },
    infoValue: { fontSize: 13, marginTop: 2 },
    settingItemCustom: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
    updateButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 8, alignItems: "center" },
    updateButtonText: { color: "#fff", fontWeight: "600" },
    logoutButton: { margin: 20, padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 40 },
    logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
