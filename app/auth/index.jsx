import { View,Text,TextInput,Pressable,StyleSheet, Alert, Image } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
 
export default function AuthScreen() {
    const { login, register } = useAuth();
    const router = useRouter();
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (isRegisterMode && !name) {
            Alert.alert("Error", "Please enter your name");
            return;
        }

        if (isRegisterMode && password.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        const result = isRegisterMode
            ? await register(email, password, name)
            : await login(email, password);
        setIsLoading(false);

        if (result.success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert(
                isRegisterMode ? "Registration Failed" : "Login Failed",
                result.error
            );
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setName("");
        setEmail("");
        setPassword("");
    };

    return (
        <View style={styles.container}>

            {/* Logo */}
            <Image
                source={require("../../assets/images/image.png")}
                style={styles.logo}
            />

            <Text style={styles.title}>Coffee</Text>
            <Text style={styles.subtitle}>
                {isRegisterMode ? "Create your account" : "Login to order"}
            </Text>

            {isRegisterMode && (
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                />
            )}

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder={isRegisterMode ? "Password (min 8 characters)" : "Password"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Pressable
                onPress={handleSubmit}
                style={[styles.button, isLoading && styles.buttonDisabled]}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading
                        ? (isRegisterMode ? "Creating account..." : "Logging in...")
                        : (isRegisterMode ? "Register" : "Login")
                    }
                </Text>
            </Pressable>

            <Pressable onPress={toggleMode} style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                    {isRegisterMode
                        ? "Already have an account? "
                        : "Don't have an account? "}
                    <Text style={styles.toggleLink}>
                        {isRegisterMode ? "Login" : "Register"}
                    </Text>
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f8f9fb",
    },

    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
        borderRadius: 10, // Remove if your logo is not circular
    },

    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#2b2d42",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#6c757d",
        marginBottom: 30,
    },
    input: {
        width: "100%",
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    button: {
        width: "100%",
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    toggleContainer: {
        marginTop: 20,
    },
    toggleText: {
        color: "#6c757d",
        fontSize: 14,
    },
    toggleLink: {
        color: "#4CAF50",
        fontWeight: "600",
    },
});
