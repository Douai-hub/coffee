import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (user) {
            router.replace('/(tabs)'); // Changed from /(tabs)/home
        } else {
            router.replace("/auth");
        }
    }, [user, loading]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fb' }}>
            <ActivityIndicator size="large" color="#4CAF50" />
        </View>
    );
}