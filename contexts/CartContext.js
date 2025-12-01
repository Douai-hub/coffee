// FILE: contexts/CartContext.js
// Copy this entire file and save it as contexts/CartContext.js

import React, { createContext, useContext, useState } from "react";
import { Alert } from "react-native";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    // Add item to cart
    const addToCart = (item, type = "Cold", size = "M") => {
        const cartItem = {
            id: `${item.id}-${type}-${size}`,
            coffeeId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            type,
            size,
            quantity: 1,
        };

        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === cartItem.id);
            
            if (existingItem) {
                // Item already exists, increase quantity
                return prevItems.map(i =>
                    i.id === cartItem.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            } else {
                // Add new item
                return [...prevItems, cartItem];
            }
        });

        Alert.alert("Success", `${item.name} (${type}, ${size}) added to cart!`);
    };

    // Remove item from cart
    const removeFromCart = (id) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    // Update item quantity
    const updateQuantity = (id, change) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(0, item.quantity + change) }
                    : item
            ).filter(item => item.quantity > 0)
        );
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
    };

    // Get cart total
    const getCartTotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = typeof item.price === 'string' 
                ? parseFloat(item.price.replace(',', '')) 
                : item.price;
            return sum + (price * item.quantity);
        }, 0);
    };

    // Get cart item count
    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within CartProvider");
    }
    return context;
}