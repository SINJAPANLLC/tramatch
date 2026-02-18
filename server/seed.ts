import { db } from "./db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  const existingUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  if (Number(existingUsers[0].count) === 0) {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminPassword2 = await bcrypt.hash("Kazuya8008", 10);
    await db.insert(users).values([
      {
        username: "admin",
        password: adminPassword,
        companyName: "トラマッチ運営",
        phone: "03-0000-0000",
        email: "admin@tramatch.jp",
        userType: "admin",
        role: "admin",
        approved: true,
      },
      {
        username: "sinjapan",
        password: adminPassword2,
        companyName: "SIN JAPAN",
        phone: "03-0000-0001",
        email: "info@sinjapan.jp",
        userType: "admin",
        role: "admin",
        approved: true,
      },
    ]);
    console.log("Admin users created");
  } else {
    console.log("Database already has users, skipping seed.");
  }
}
