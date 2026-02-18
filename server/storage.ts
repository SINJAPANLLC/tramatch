import {
  type User, type InsertUser,
  type CargoListing, type InsertCargoListing,
  type TruckListing, type InsertTruckListing,
  type Notification, type InsertNotification,
  type Announcement, type InsertAnnouncement,
  type DispatchRequest, type InsertDispatchRequest,
  type Partner, type InsertPartner,
  type TransportRecord, type InsertTransportRecord,
  type SeoArticle, type InsertSeoArticle,
  type AdminSetting,
  users, cargoListings, truckListings, notifications, announcements, dispatchRequests,
  partners, transportRecords, seoArticles, adminSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteSessionsByUserId(userId: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  approveUser(id: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getCargoListings(): Promise<CargoListing[]>;
  getCargoListing(id: string): Promise<CargoListing | undefined>;
  createCargoListing(listing: InsertCargoListing, userId?: string): Promise<CargoListing>;

  getTruckListings(): Promise<TruckListing[]>;
  getTruckListing(id: string): Promise<TruckListing | undefined>;
  createTruckListing(listing: InsertTruckListing, userId?: string): Promise<TruckListing>;

  updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;

  deleteCargoListing(id: string): Promise<boolean>;
  deleteTruckListing(id: string): Promise<boolean>;
  incrementCargoViewCount(id: string): Promise<void>;
  updateCargoStatus(id: string, status: string): Promise<CargoListing | undefined>;
  updateCargoListing(id: string, data: Partial<CargoListing>): Promise<CargoListing | undefined>;

  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<boolean>;

  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<InsertAnnouncement & { isPublished: boolean }>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;

  getDispatchRequestByCargoId(cargoId: string): Promise<DispatchRequest | undefined>;
  createDispatchRequest(data: InsertDispatchRequest): Promise<DispatchRequest>;
  updateDispatchRequest(id: string, data: Partial<DispatchRequest>): Promise<DispatchRequest | undefined>;

  searchCompanies(query: string): Promise<Partial<User>[]>;

  getPartnersByUserId(userId: string): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  createPartner(data: InsertPartner): Promise<Partner>;
  updatePartner(id: string, data: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: string): Promise<boolean>;

  getTransportRecordsByUserId(userId: string): Promise<TransportRecord[]>;
  getTransportRecord(id: string): Promise<TransportRecord | undefined>;
  createTransportRecord(data: InsertTransportRecord): Promise<TransportRecord>;
  updateTransportRecord(id: string, data: Partial<InsertTransportRecord>): Promise<TransportRecord | undefined>;
  deleteTransportRecord(id: string): Promise<boolean>;

  getSeoArticles(): Promise<SeoArticle[]>;
  createSeoArticle(data: InsertSeoArticle): Promise<SeoArticle>;
  updateSeoArticle(id: string, data: Partial<InsertSeoArticle>): Promise<SeoArticle | undefined>;
  deleteSeoArticle(id: string): Promise<boolean>;

  getAdminSetting(key: string): Promise<string | undefined>;
  setAdminSetting(key: string, value: string): Promise<void>;
  getAllAdminSettings(): Promise<AdminSetting[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
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

  async deleteSessionsByUserId(userId: string): Promise<void> {
    await db.execute(
      `DELETE FROM "session" WHERE sess::text LIKE '%"userId":"${userId}"%'`
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async approveUser(id: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ approved: true }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined> {
    const allowedFields = [
      "companyName", "companyNameKana", "address", "postalCode", "contactName",
      "phone", "fax", "email", "paymentTerms", "businessDescription",
      "representative", "establishedDate", "capital", "employeeCount",
      "businessArea", "transportLicenseNumber", "websiteUrl",
      "invoiceRegistrationNumber", "truckCount", "officeLocations", "majorClients",
      "annualRevenue", "bankInfo", "closingMonth", "closingDay", "paymentMonth", "paymentDay",
      "memberOrganization", "digitalTachographCount", "gpsCount",
      "safetyExcellenceCert", "greenManagementCert", "iso9000", "iso14000", "iso39001",
      "cargoInsurance", "bankName", "bankBranch", "accountType", "accountNumber",
      "accountHolderKana", "plan"
    ] as const;
    const updateData: Record<string, string | null> = {};
    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        updateData[field] = (data as any)[field];
      }
    }
    if (data.email !== undefined) {
      updateData.username = data.email;
    }
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getCargoListings(): Promise<CargoListing[]> {
    return db.select().from(cargoListings).orderBy(desc(cargoListings.createdAt));
  }

  async getCargoListing(id: string): Promise<CargoListing | undefined> {
    const [listing] = await db.select().from(cargoListings).where(eq(cargoListings.id, id));
    return listing;
  }

  async createCargoListing(listing: InsertCargoListing, userId?: string): Promise<CargoListing> {
    const [created] = await db.insert(cargoListings).values({ ...listing, userId: userId || null }).returning();
    return created;
  }

  async getTruckListings(): Promise<TruckListing[]> {
    return db.select().from(truckListings).orderBy(desc(truckListings.createdAt));
  }

  async getTruckListing(id: string): Promise<TruckListing | undefined> {
    const [listing] = await db.select().from(truckListings).where(eq(truckListings.id, id));
    return listing;
  }

  async createTruckListing(listing: InsertTruckListing, userId?: string): Promise<TruckListing> {
    const [created] = await db.insert(truckListings).values({ ...listing, userId: userId || null }).returning();
    return created;
  }

  async deleteCargoListing(id: string): Promise<boolean> {
    const result = await db.delete(cargoListings).where(eq(cargoListings.id, id)).returning();
    return result.length > 0;
  }

  async deleteTruckListing(id: string): Promise<boolean> {
    const result = await db.delete(truckListings).where(eq(truckListings.id, id)).returning();
    return result.length > 0;
  }

  async incrementCargoViewCount(id: string): Promise<void> {
    await db.update(cargoListings)
      .set({ viewCount: sql`${cargoListings.viewCount} + 1` })
      .where(eq(cargoListings.id, id));
  }

  async updateCargoStatus(id: string, status: string): Promise<CargoListing | undefined> {
    const [updated] = await db.update(cargoListings)
      .set({ status })
      .where(eq(cargoListings.id, id))
      .returning();
    return updated;
  }

  async updateCargoListing(id: string, data: Partial<CargoListing>): Promise<CargoListing | undefined> {
    const { id: _id, createdAt: _createdAt, userId: _userId, ...safeData } = data as any;
    const [updated] = await db.update(cargoListings)
      .set(safeData)
      .where(eq(cargoListings.id, id))
      .returning();
    return updated;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const unread = await db.select().from(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
    return unread.length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications).set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
    return result.length > 0;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [item] = await db.select().from(announcements).where(eq(announcements.id, id));
    return item;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  async updateAnnouncement(id: string, data: Partial<InsertAnnouncement & { isPublished: boolean }>): Promise<Announcement | undefined> {
    const [updated] = await db.update(announcements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const result = await db.delete(announcements).where(eq(announcements.id, id)).returning();
    return result.length > 0;
  }

  async getDispatchRequestByCargoId(cargoId: string): Promise<DispatchRequest | undefined> {
    const [request] = await db.select().from(dispatchRequests).where(eq(dispatchRequests.cargoId, cargoId));
    return request;
  }

  async createDispatchRequest(data: InsertDispatchRequest): Promise<DispatchRequest> {
    const [request] = await db.insert(dispatchRequests).values(data).returning();
    return request;
  }

  async updateDispatchRequest(id: string, data: Partial<DispatchRequest>): Promise<DispatchRequest | undefined> {
    const { id: _id, createdAt: _createdAt, ...safeData } = data as any;
    const [updated] = await db.update(dispatchRequests)
      .set(safeData)
      .where(eq(dispatchRequests.id, id))
      .returning();
    return updated;
  }

  async searchCompanies(query: string): Promise<Partial<User>[]> {
    const pattern = `%${query}%`;
    const results = await db.select({
      id: users.id,
      companyName: users.companyName,
      companyNameKana: users.companyNameKana,
      address: users.address,
      phone: users.phone,
      fax: users.fax,
      email: users.email,
      contactName: users.contactName,
      userType: users.userType,
      truckCount: users.truckCount,
      businessArea: users.businessArea,
      representative: users.representative,
      businessDescription: users.businessDescription,
      transportLicenseNumber: users.transportLicenseNumber,
    }).from(users).where(
      and(
        eq(users.approved, true),
        or(
          ilike(users.companyName, pattern),
          ilike(users.address, pattern),
          ilike(users.businessArea, pattern),
          ilike(users.contactName, pattern),
        )
      )
    );
    return results;
  }

  async getPartnersByUserId(userId: string): Promise<Partner[]> {
    return db.select().from(partners).where(eq(partners.userId, userId)).orderBy(desc(partners.createdAt));
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    const [p] = await db.select().from(partners).where(eq(partners.id, id));
    return p;
  }

  async createPartner(data: InsertPartner): Promise<Partner> {
    const [p] = await db.insert(partners).values(data).returning();
    return p;
  }

  async updatePartner(id: string, data: Partial<InsertPartner>): Promise<Partner | undefined> {
    const [p] = await db.update(partners).set(data).where(eq(partners.id, id)).returning();
    return p;
  }

  async deletePartner(id: string): Promise<boolean> {
    const result = await db.delete(partners).where(eq(partners.id, id)).returning();
    return result.length > 0;
  }

  async getTransportRecordsByUserId(userId: string): Promise<TransportRecord[]> {
    return db.select().from(transportRecords).where(eq(transportRecords.userId, userId)).orderBy(desc(transportRecords.createdAt));
  }

  async getTransportRecord(id: string): Promise<TransportRecord | undefined> {
    const [r] = await db.select().from(transportRecords).where(eq(transportRecords.id, id));
    return r;
  }

  async createTransportRecord(data: InsertTransportRecord): Promise<TransportRecord> {
    const [r] = await db.insert(transportRecords).values(data).returning();
    return r;
  }

  async updateTransportRecord(id: string, data: Partial<InsertTransportRecord>): Promise<TransportRecord | undefined> {
    const [r] = await db.update(transportRecords).set(data).where(eq(transportRecords.id, id)).returning();
    return r;
  }

  async deleteTransportRecord(id: string): Promise<boolean> {
    const result = await db.delete(transportRecords).where(eq(transportRecords.id, id)).returning();
    return result.length > 0;
  }

  async getSeoArticles(): Promise<SeoArticle[]> {
    return db.select().from(seoArticles).orderBy(desc(seoArticles.createdAt));
  }

  async createSeoArticle(data: InsertSeoArticle): Promise<SeoArticle> {
    const [a] = await db.insert(seoArticles).values(data).returning();
    return a;
  }

  async updateSeoArticle(id: string, data: Partial<InsertSeoArticle>): Promise<SeoArticle | undefined> {
    const [a] = await db.update(seoArticles).set(data).where(eq(seoArticles.id, id)).returning();
    return a;
  }

  async deleteSeoArticle(id: string): Promise<boolean> {
    const result = await db.delete(seoArticles).where(eq(seoArticles.id, id)).returning();
    return result.length > 0;
  }

  async getAdminSetting(key: string): Promise<string | undefined> {
    const [s] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return s?.value;
  }

  async setAdminSetting(key: string, value: string): Promise<void> {
    const existing = await this.getAdminSetting(key);
    if (existing !== undefined) {
      await db.update(adminSettings).set({ value, updatedAt: new Date() }).where(eq(adminSettings.key, key));
    } else {
      await db.insert(adminSettings).values({ key, value });
    }
  }

  async getAllAdminSettings(): Promise<AdminSetting[]> {
    return db.select().from(adminSettings);
  }
}

export const storage = new DatabaseStorage();
