import { users, type User, type InsertUser, datasets, type Dataset, type InsertDataset } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// The interface remains the same
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<Omit<User, "password">[]>; 
  createUser(user: InsertUser): Promise<User>;
  
  // Dataset operations
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  getDatasetsByUserId(userId: number): Promise<Dataset[]>;
  getDataset(id: number): Promise<Dataset | undefined>;
  deleteDataset(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getAllUsers(): Promise<Omit<User, "password">[]> {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      createdAt: users.createdAt
    }).from(users);
    return allUsers;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const [dataset] = await db.insert(datasets).values(insertDataset).returning();
    return dataset;
  }
  
  async getDatasetsByUserId(userId: number): Promise<Dataset[]> {
    return await db.select().from(datasets).where(eq(datasets.userId, userId));
  }
  
  async getDataset(id: number): Promise<Dataset | undefined> {
    const [dataset] = await db.select().from(datasets).where(eq(datasets.id, id));
    return dataset;
  }
  
  async deleteDataset(id: number): Promise<boolean> {
    const result = await db.delete(datasets).where(eq(datasets.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
