import { Account, Client, Databases, ID, Query } from 'appwrite';

const client = new Client();

client.setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

//init databases
export const databases = new Databases(client);
export const account = new Account(client);

export const config = {
    db: process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
    col: {
        todos: process.env.EXPO_PUBLIC_APPWRITE_COL_NOTES_ID
    }
}

export { ID, Query };