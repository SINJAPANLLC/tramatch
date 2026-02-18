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
  type Payment, type InsertPayment,
  type AdminSetting,
  type NotificationTemplate, type InsertNotificationTemplate,
  type ContactInquiry, type InsertContactInquiry,
  type PlanChangeRequest, type InsertPlanChangeRequest,
  type UserAddRequest, type InsertUserAddRequest,
  type Invoice, type InsertInvoice,
  users, cargoListings, truckListings, notifications, announcements, dispatchRequests,
  partners, transportRecords, seoArticles, payments, adminSettings, notificationTemplates,
  passwordResetTokens, auditLogs, type AuditLog, contactInquiries, planChangeRequests, userAddRequests,
  invoices
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, ilike, or, gte } from "drizzle-orm";

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

  getDispatchRequest(id: string): Promise<DispatchRequest | undefined>;
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
  getPublishedSeoArticles(): Promise<SeoArticle[]>;
  getSeoArticleBySlug(slug: string): Promise<SeoArticle | undefined>;
  getTodayAutoArticleCount(): Promise<number>;
  createSeoArticle(data: InsertSeoArticle): Promise<SeoArticle>;
  updateSeoArticle(id: string, data: Partial<InsertSeoArticle>): Promise<SeoArticle | undefined>;
  deleteSeoArticle(id: string): Promise<boolean>;

  createPayment(data: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: string, status: string, squarePaymentId: string | null): Promise<void>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;

  getAdminSetting(key: string): Promise<string | undefined>;
  setAdminSetting(key: string, value: string): Promise<void>;
  getAllAdminSettings(): Promise<AdminSetting[]>;

  getNotificationTemplates(): Promise<NotificationTemplate[]>;
  getNotificationTemplatesByCategory(category: string): Promise<NotificationTemplate[]>;
  getNotificationTemplatesByChannel(channel: string): Promise<NotificationTemplate[]>;
  getNotificationTemplate(id: string): Promise<NotificationTemplate | undefined>;
  createNotificationTemplate(data: InsertNotificationTemplate): Promise<NotificationTemplate>;
  updateNotificationTemplate(id: string, data: Partial<InsertNotificationTemplate & { isActive: boolean }>): Promise<NotificationTemplate | undefined>;
  deleteNotificationTemplate(id: string): Promise<boolean>;

  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date; used: boolean } | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;

  updateTruckListing(id: string, data: Partial<TruckListing>): Promise<TruckListing | undefined>;

  createAuditLog(log: { userId?: string; userName?: string; action: string; targetType: string; targetId?: string; details?: string; ipAddress?: string }): Promise<void>;
  getAuditLogs(limit?: number, offset?: number): Promise<AuditLog[]>;
  getAuditLogCount(): Promise<number>;

  createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry>;
  getContactInquiries(): Promise<ContactInquiry[]>;
  getContactInquiry(id: string): Promise<ContactInquiry | undefined>;
  updateContactInquiryStatus(id: string, status: string, adminNote?: string): Promise<ContactInquiry | undefined>;
  deleteContactInquiry(id: string): Promise<boolean>;
  getUnreadContactCount(): Promise<number>;

  createPlanChangeRequest(data: InsertPlanChangeRequest): Promise<PlanChangeRequest>;
  getPlanChangeRequests(): Promise<PlanChangeRequest[]>;
  getPlanChangeRequestsByUserId(userId: string): Promise<PlanChangeRequest[]>;
  getPendingPlanChangeRequest(userId: string): Promise<PlanChangeRequest | undefined>;
  updatePlanChangeRequestStatus(id: string, status: string, adminNote?: string): Promise<PlanChangeRequest | undefined>;

  createUserAddRequest(data: InsertUserAddRequest): Promise<UserAddRequest>;
  getUserAddRequests(): Promise<UserAddRequest[]>;
  getUserAddRequestsByRequesterId(requesterId: string): Promise<UserAddRequest[]>;
  updateUserAddRequestStatus(id: string, status: string, adminNote?: string): Promise<UserAddRequest | undefined>;

  createInvoice(data: InsertInvoice): Promise<Invoice>;
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByUserId(userId: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: string, status: string, paidAt?: Date): Promise<Invoice | undefined>;
  updateInvoiceSentAt(id: string, sentAt: Date): Promise<Invoice | undefined>;
  updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getNextInvoiceNumber(): Promise<string>;
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
      "accountHolderKana", "plan",
      "accountingContactName", "accountingContactEmail", "accountingContactPhone", "accountingContactFax",
      "lineUserId", "notifySystem", "notifyEmail", "notifyLine"
    ] as const;
    const updateData: Record<string, string | boolean | null> = {};
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
    const result = await db.execute(sql`SELECT nextval('cargo_number_seq') as next_num`);
    const nextNumber = Number((result as any).rows?.[0]?.next_num ?? (result as any)[0]?.next_num ?? 0);
    const [created] = await db.insert(cargoListings).values({ ...listing, userId: userId || null, cargoNumber: nextNumber || null }).returning();
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

  async getDispatchRequest(id: string): Promise<DispatchRequest | undefined> {
    const [request] = await db.select().from(dispatchRequests).where(eq(dispatchRequests.id, id));
    return request;
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

  async getPublishedSeoArticles(): Promise<SeoArticle[]> {
    return db.select().from(seoArticles).where(eq(seoArticles.status, "published")).orderBy(desc(seoArticles.createdAt));
  }

  async getSeoArticleBySlug(slug: string): Promise<SeoArticle | undefined> {
    const [a] = await db.select().from(seoArticles).where(eq(seoArticles.slug, slug));
    return a;
  }

  async getTodayAutoArticleCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const results = await db.select().from(seoArticles)
      .where(and(eq(seoArticles.autoGenerated, true), gte(seoArticles.createdAt, today)));
    return results.length;
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

  async createPayment(data: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async updatePaymentStatus(id: string, status: string, squarePaymentId: string | null): Promise<void> {
    await db.update(payments).set({ status, squarePaymentId }).where(eq(payments.id, id));
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async getAllPayments(): Promise<Payment[]> {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getAllAdminSettings(): Promise<AdminSetting[]> {
    return db.select().from(adminSettings);
  }

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return db.select().from(notificationTemplates).orderBy(desc(notificationTemplates.createdAt));
  }

  async getNotificationTemplatesByCategory(category: string): Promise<NotificationTemplate[]> {
    return db.select().from(notificationTemplates).where(eq(notificationTemplates.category, category)).orderBy(desc(notificationTemplates.createdAt));
  }

  async getNotificationTemplatesByChannel(channel: string): Promise<NotificationTemplate[]> {
    return db.select().from(notificationTemplates).where(eq(notificationTemplates.channel, channel)).orderBy(desc(notificationTemplates.createdAt));
  }

  async getNotificationTemplate(id: string): Promise<NotificationTemplate | undefined> {
    const [template] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, id));
    return template;
  }

  async createNotificationTemplate(data: InsertNotificationTemplate): Promise<NotificationTemplate> {
    const [template] = await db.insert(notificationTemplates).values(data).returning();
    return template;
  }

  async updateNotificationTemplate(id: string, data: Partial<InsertNotificationTemplate & { isActive: boolean }>): Promise<NotificationTemplate | undefined> {
    const [template] = await db.update(notificationTemplates).set({ ...data, updatedAt: new Date() }).where(eq(notificationTemplates.id, id)).returning();
    return template;
  }

  async deleteNotificationTemplate(id: string): Promise<boolean> {
    const result = await db.delete(notificationTemplates).where(eq(notificationTemplates.id, id)).returning();
    return result.length > 0;
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
  }

  async getPasswordResetToken(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date; used: boolean } | undefined> {
    const [row] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return row ? { id: row.id, userId: row.userId, token: row.token, expiresAt: row.expiresAt, used: row.used } : undefined;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.token, token));
  }

  async updateTruckListing(id: string, data: Partial<TruckListing>): Promise<TruckListing | undefined> {
    const { id: _id, createdAt: _createdAt, userId: _userId, ...safeData } = data as any;
    const [updated] = await db.update(truckListings)
      .set(safeData)
      .where(eq(truckListings.id, id))
      .returning();
    return updated;
  }

  async createAuditLog(log: { userId?: string; userName?: string; action: string; targetType: string; targetId?: string; details?: string; ipAddress?: string }): Promise<void> {
    await db.insert(auditLogs).values(log);
  }

  async getAuditLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  }

  async getAuditLogCount(): Promise<number> {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(auditLogs);
    return row?.count || 0;
  }

  async createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry> {
    const [result] = await db.insert(contactInquiries).values(inquiry).returning();
    return result;
  }

  async getContactInquiries(): Promise<ContactInquiry[]> {
    return db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
  }

  async getContactInquiry(id: string): Promise<ContactInquiry | undefined> {
    const [result] = await db.select().from(contactInquiries).where(eq(contactInquiries.id, id));
    return result;
  }

  async updateContactInquiryStatus(id: string, status: string, adminNote?: string): Promise<ContactInquiry | undefined> {
    const values: Partial<ContactInquiry> = { status };
    if (adminNote !== undefined) values.adminNote = adminNote;
    const [result] = await db.update(contactInquiries).set(values).where(eq(contactInquiries.id, id)).returning();
    return result;
  }

  async deleteContactInquiry(id: string): Promise<boolean> {
    const result = await db.delete(contactInquiries).where(eq(contactInquiries.id, id)).returning();
    return result.length > 0;
  }

  async getUnreadContactCount(): Promise<number> {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(contactInquiries).where(eq(contactInquiries.status, "unread"));
    return row?.count || 0;
  }

  async createPlanChangeRequest(data: InsertPlanChangeRequest): Promise<PlanChangeRequest> {
    const [request] = await db.insert(planChangeRequests).values(data).returning();
    return request;
  }

  async getPlanChangeRequests(): Promise<PlanChangeRequest[]> {
    return db.select().from(planChangeRequests).orderBy(desc(planChangeRequests.createdAt));
  }

  async getPlanChangeRequestsByUserId(userId: string): Promise<PlanChangeRequest[]> {
    return db.select().from(planChangeRequests).where(eq(planChangeRequests.userId, userId)).orderBy(desc(planChangeRequests.createdAt));
  }

  async getPendingPlanChangeRequest(userId: string): Promise<PlanChangeRequest | undefined> {
    const [request] = await db.select().from(planChangeRequests).where(and(eq(planChangeRequests.userId, userId), eq(planChangeRequests.status, "pending")));
    return request;
  }

  async updatePlanChangeRequestStatus(id: string, status: string, adminNote?: string): Promise<PlanChangeRequest | undefined> {
    const [request] = await db.update(planChangeRequests).set({ status, adminNote, reviewedAt: new Date() }).where(eq(planChangeRequests.id, id)).returning();
    return request;
  }

  async createUserAddRequest(data: InsertUserAddRequest): Promise<UserAddRequest> {
    const [request] = await db.insert(userAddRequests).values(data).returning();
    return request;
  }

  async getUserAddRequests(): Promise<UserAddRequest[]> {
    return db.select().from(userAddRequests).orderBy(desc(userAddRequests.createdAt));
  }

  async getUserAddRequestsByRequesterId(requesterId: string): Promise<UserAddRequest[]> {
    return db.select().from(userAddRequests).where(eq(userAddRequests.requesterId, requesterId)).orderBy(desc(userAddRequests.createdAt));
  }

  async updateUserAddRequestStatus(id: string, status: string, adminNote?: string): Promise<UserAddRequest | undefined> {
    const [request] = await db.update(userAddRequests).set({ status, adminNote, reviewedAt: new Date() }).where(eq(userAddRequests.id, id)).returning();
    return request;
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(data).returning();
    return invoice;
  }

  async getInvoices(): Promise<Invoice[]> {
    return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoicesByUserId(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async updateInvoiceStatus(id: string, status: string, paidAt?: Date): Promise<Invoice | undefined> {
    const updateData: any = { status };
    if (paidAt) updateData.paidAt = paidAt;
    const [invoice] = await db.update(invoices).set(updateData).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  async updateInvoiceSentAt(id: string, sentAt: Date): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices).set({ sentAt }).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(invoices).where(sql`invoice_number LIKE ${yearMonth + "%"}`);
    const seq = (Number(result?.count || 0) + 1).toString().padStart(4, "0");
    return `INV-${yearMonth}-${seq}`;
  }
}

export const storage = new DatabaseStorage();
