import { users, brandGuides, type User, type InsertUser, type BrandGuide, type InsertBrandGuide } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBrandGuide(sessionId: string): Promise<BrandGuide | undefined>;
  saveBrandGuide(guide: InsertBrandGuide): Promise<BrandGuide>;
  updateBrandGuide(id: string, guideData: any): Promise<BrandGuide | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getBrandGuide(sessionId: string): Promise<BrandGuide | undefined> {
    const result = await db.select().from(brandGuides).where(eq(brandGuides.sessionId, sessionId)).limit(1);
    return result[0];
  }

  async saveBrandGuide(guide: InsertBrandGuide): Promise<BrandGuide> {
    const result = await db.insert(brandGuides).values(guide).returning();
    return result[0];
  }

  async updateBrandGuide(id: string, guideData: any): Promise<BrandGuide | undefined> {
    const result = await db.update(brandGuides)
      .set({ 
        guideData,
        updatedAt: new Date()
      })
      .where(eq(brandGuides.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
