import { Query } from "appwrite";
import { config, databases, ID, account } from "./appwriteConfig";

// Create a new order
export const createOrder = async (items, totalAmount, address) => {
    try {
        const userId = account.currentUser?.$id;
        if (!userId) throw new Error("User not logged in");

        const newOrder = await databases.createDocument(
            config.db,
            config.col.orders,
            ID.unique(),
            {
                userId,
                status: "pending",
                totalAmount,
                items: JSON.stringify(items),
                address: JSON.stringify(address),
            }
        );

        return newOrder;
    } catch (error) {
        throw error;
    }
};

// Fetch all orders (optional: for admin or general use)
export const fetchOrders = async () => {
    try {
        const response = await databases.listDocuments(
            config.db,
            config.col.orders
        );
        return response.documents.map(doc => ({
            ...doc,
            items: JSON.parse(doc.items),
            address: JSON.parse(doc.address),
        }));
    } catch (error) {
        throw error;
    }
};

// Fetch orders for a specific user
export const fetchOrdersByUserId = async () => {
    try {
        const userId = account.currentUser?.$id;
        if (!userId) throw new Error("User not logged in");

        const response = await databases.listDocuments(
            config.db,
            config.col.orders,
            [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
        );

        return response.documents.map(doc => ({
            ...doc,
            items: JSON.parse(doc.items),
            address: JSON.parse(doc.address),
        }));
    } catch (error) {
        throw error;
    }
};

// Update order status or any other fields
export const updateOrder = async (id, data) => {
    try {
        const updatedOrder = await databases.updateDocument(
            config.db,
            config.col.orders,
            id,
            data
        );
        return updatedOrder;
    } catch (error) {
        throw error;
    }
};

// Delete an order
export const removeOrder = async (id) => {
    try {
        await databases.deleteDocument(config.db, config.col.orders, id);
    } catch (error) {
        throw error;
    }
};

// Get a single order by ID
export const getOrderById = async (id) => {
    try {
        const response = await databases.getDocument(config.db, config.col.orders, id);
        return {
            ...response,
            items: JSON.parse(response.items),
            address: JSON.parse(response.address),
        };
    } catch (error) {
        throw error;
    }
};
