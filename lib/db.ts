import { MongoClient, Db } from 'mongodb';
import { Author, Article } from './types';
import { INITIAL_AUTHORS, INITIAL_ARTICLES } from './initial-data';

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI;

export type { Author };
export type { Article };

export { INITIAL_AUTHORS, INITIAL_ARTICLES };

// Lazy initialization of MongoDB
export async function getDb(): Promise<{ db: Db | null; client: MongoClient | null; isUsingFallback: boolean }> {
  if (!MONGODB_URI) {
    return { db: null, client: null, isUsingFallback: true };
  }

  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        connectTimeoutMS: 2000, // Reduced connection timeout for faster fallback
        socketTimeoutMS: 2000,  // Reduced socket timeout for faster fallback
      });
      await client.connect();
      db = client.db('kachua_protidin');
      console.log('Successfully connected to MongoDB!');
    }
    return { db, client, isUsingFallback: false };
  } catch (error) {
    console.error('Failed to connect to MongoDB, falling back', error);
    return { db: null, client: null, isUsingFallback: true };
  }
}
