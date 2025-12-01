import { account, ID } from './appwriteConfig';

// Register user
export const register = async (email, password, name) => {
    try {
        // Appwrite expects positional arguments, not an object
        await account.create(ID.unique(), email, password, name);

        // Optional: auto-login after registration
        await login(email, password);
    } catch (error) {
        throw error;
    }
};

// Login user
export const login = async (email, password) => {
    try {
        // Positional arguments again
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw error;
    }
};

// Logout current session
export const logout = async () => {
    try {
        await account.deleteSession('current');
    } catch (error) {
        throw error;
    }
};

// Get currently logged-in user
export const getUser = async () => {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        throw error;
    }
};
