import React, { createContext, useContext, useState, useEffect } from "react";
import { account,storage,ID } from "../services/appwriteConfig";
export const uploadProfilePhoto = async (uri) => {
  try {
    if (!uri) return { success: false, error: "No image selected" };

    // Just return the local URI without uploading
    return { success: true, url: uri };
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    return { success: false, error: error.message };
  }
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            console.log('User logged in:', currentUser.email);
        } catch (error) {
            // User is not logged in
            setUser(null);
            console.log('No active session');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            // Delete any existing sessions first
            try {
                await account.deleteSession('current');
            } catch (error) {
                // No active session to delete
            }

            // Create new session
            await account.createEmailPasswordSession(email, password);
            const currentUser = await account.get();
            setUser(currentUser);
            console.log('Login successful:', currentUser.email);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);

            // Provide user-friendly error messages
            let errorMessage = 'Login failed. Please try again.';

            if (error.message?.includes('Invalid credentials')) {
                errorMessage = 'Invalid email or password.';
            } else if (error.message?.includes('Rate limit')) {
                errorMessage = 'Too many attempts. Please try again later.';
            } else if (error.code === 401) {
                errorMessage = 'Invalid email or password.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const register = async (email, password, name) => {
        try {
            // Validate inputs
            if (!email || !password || !name) {
                return { success: false, error: 'All fields are required.' };
            }

            if (password.length < 8) {
                return { success: false, error: 'Password must be at least 8 characters.' };
            }

            // Create account
            console.log('Creating account for:', email);
            await account.create(ID.unique(), email, password, name);

            // Auto login after registration
            console.log('Account created, logging in...');
            const loginResult = await login(email, password);

            if (loginResult.success) {
                console.log('Registration and login successful');
            }

            return loginResult;
        } catch (error) {
            console.error('Register error:', error);

            // Provide user-friendly error messages
            let errorMessage = 'Registration failed. Please try again.';

            if (error.message?.includes('already exists')) {
                errorMessage = 'An account with this email already exists.';
            } else if (error.message?.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 409) {
                errorMessage = 'An account with this email already exists.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails on server, clear local user state
            setUser(null);
        }
    };

    const updateProfile = async (name) => {
        try {
            const updatedUser = await account.updateName(name);
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            await account.updatePassword(newPassword, oldPassword);
            return { success: true };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            updateProfile,
            changePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}