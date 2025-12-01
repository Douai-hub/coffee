import { Tabs } from "expo-router";
import { Ionicons } from "react-native-vector-icons"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // hide top headers
        tabBarActiveTintColor: "#00052eff",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />),
        }} />

      <Tabs.Screen name="profile" options={{
        title: "Profile", tabBarIcon: ({ color, size }) => (
          <Ionicons name="people" color={color} size={size} />),
      }} />
      <Tabs.Screen name="setting" options={{
        title: "Setting", tabBarIcon: ({ color, size }) => (
          <Ionicons name="settings" color={color} size={size} />),
      }} />
    </Tabs>
  );
}
