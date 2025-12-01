import { View, Text, ScrollView, Image, Pressable, StyleSheet, TextInput, } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { useCart } from "../../contexts/CartContext";
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const coffee = [
  { id: 1, name: "Latte", price: 2.55, image: "https://www.brighteyedbaker.com/wp-content/uploads/2024/03/Spanish-Iced-Latte.jpg" },
  { id: 2, name: "Americano", price: 2.00, image: "https://images.ctfassets.net/v601h1fyjgba/1vlXSpBbgUo9yLzh71tnOT/a1afdbe54a383d064576b5e628035f04/Iced_Americano.jpg"},
  { id: 3, name: "Cappuccino", price: 2.65, image: "https://130529051.cdn6.editmysite.com/uploads/1/3/0/5/130529051/V3O3FIVEAP2WHOYTSKFLMVCN.jpeg" },
  { id: 4, name: "Espresso", price: 2.00, image: "https://images.squarespace-cdn.com/content/v1/5e5be427805a63534f1344ad/530ba631-0ae2-43f4-bf30-b4cd1113361c/Brewing-With-Dani-home-barista-online-course-iced-espresso-drink-iced-shaken-espresso.jpeg"},
  { id: 5, name: "Mocha", price: 2.55, image: "https://vibrantlygfree.com/wp-content/uploads/2023/07/iced-mocha-1.jpg" },
];

export default function Home() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { addToCart, getCartItemCount } = useCart();
  const [search, setSearch] = useState("");

  // Filter coffee based on search input
  const filteredCoffee = coffee.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const cartItemCount = getCartItemCount();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header with profile, cart & logout */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Coffee Time</Text>
          <View style={styles.headerButtons}>
            <Pressable 
              onPress={() => router.push("/profile")} 
              style={[styles.iconButton, { backgroundColor: theme.primary }]}
            >
              <Icon
                name={"people"}
                size={24}
                color={isDarkMode ? "#ffffffff" : "#000000ff"}
              />
            </Pressable>
            
            <Pressable 
              onPress={() => router.push("/cart")} 
              style={[styles.iconButton, { backgroundColor: theme.primary }]}
            >
              <Icon
                name={"cart"}
                size={24}
                color={isDarkMode ? "#ffffffff" : "#000000ff"}
              />
              {cartItemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View style={[styles.searchContainer, { 
          backgroundColor: theme.cardBackground, 
          marginBottom: 20, 
          paddingHorizontal: 20, 
          paddingVertical: 10, 
          borderRadius: 12 
        }]}>
          <TextInput
            placeholder="Search ..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* coffee list */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredCoffee.map((item) => {
            return <CoffeeCard key={item.id} item={item} theme={theme} addToCart={addToCart} router={router} />;
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Separate component for each coffee card
function CoffeeCard({ item, theme, addToCart, router }) {
  const [type, setType] = useState("Cold");
  const [size, setSize] = useState("M");

  const handleQuickOrder = () => {
    addToCart(item, type, size);
  };

  const handleViewDetails = () => {
    router.push(`/coffee/${item.id}`);
  };

  return (
    <View style={[styles.cardHorizontal, { backgroundColor: theme.cardBackground }]}>
      {/* LEFT SIDE IMAGE - Make it clickable */}
      <Pressable onPress={handleViewDetails}>
        <Image source={{ uri: item.image }} style={styles.coffeeImageHorizontal} />
        
      </Pressable>

      {/* RIGHT SIDE CONTENT */}
      <View style={styles.cardContent}>
        <Pressable onPress={handleViewDetails}>
          <Text style={[styles.coffeeName, { color: theme.text }]}>
            {item.name}
          </Text>
        </Pressable>
        <Text style={[styles.coffeePrice, { color: theme.textSecondary }]}>
          ${item.price.toFixed(2)}
        </Text>

        {/* Hot / Cold selector */}
        <View style={styles.optionRow}>
          {["Hot", "Cold"].map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              style={[
                styles.optionButton,
                type === t && { backgroundColor: theme.primary }
              ]}
            >
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

        {/* Size selector */}
        <View style={styles.optionRow}>
          {["S", "M", "L"].map((s) => (
            <Pressable
              key={s}
              onPress={() => setSize(s)}
              style={[
                styles.sizeButton,
                size === s && { backgroundColor: theme.text }
              ]}
            >
              <Text
                style={[
                  styles.sizeText,
                  { color: size === s ? "#a29c9cff" : theme.text }
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Buttons Row */}
        <View style={styles.buttonRow}>
         
          <Pressable 
            style={[styles.orderButton, { backgroundColor: theme.danger }]}
            onPress={handleQuickOrder}
          >
            <Text style={styles.orderButtonText}>Add to Cart</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "700" },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff6b6b",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  searchInput: {
    fontSize: 20,
  },
  cardHorizontal: {
    flexDirection: "row",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    gap: 15
  },
  coffeeImageHorizontal: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  viewDetailsOverlay: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  coffeeName: { fontSize: 20, fontWeight: "600" },
  coffeePrice: { fontSize: 16, marginBottom: 10 },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 5,
  },
  optionButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  sizeButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 5,
    
  },
  
  detailButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  orderButton: { 
    flex: 1,
    padding: 10, 
    borderRadius: 8, 
    alignItems: "center",
  },
  orderButtonText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 14,
  },
});