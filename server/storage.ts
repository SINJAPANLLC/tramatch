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
  type Agent, type InsertAgent,
  type AiTrainingExample, type InsertAiTrainingExample,
  type AiCorrectionLog, type InsertAiCorrectionLog,
  type YoutubeVideo, type InsertYoutubeVideo,
  type YoutubeAutoPublishJob,
  type EmailCampaign, type InsertEmailCampaign,
  type EmailLead, type InsertEmailLead,
  users, cargoListings, truckListings, notifications, announcements, dispatchRequests,
  partners, transportRecords, seoArticles, payments, adminSettings, notificationTemplates,
  passwordResetTokens, auditLogs, type AuditLog, contactInquiries, planChangeRequests, userAddRequests,
  invoices, agents, aiTrainingExamples, aiCorrectionLogs, youtubeVideos, youtubeAutoPublishJobs,
  emailCampaigns, emailLeads
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

  getCargoListings(options?: { status?: string; limit?: number; offset?: number }): Promise<CargoListing[]>;
  getCargoListingsByUserId(userId: string): Promise<CargoListing[]>;
  getCargoListing(id: string): Promise<CargoListing | undefined>;
  createCargoListing(listing: InsertCargoListing, userId?: string): Promise<CargoListing>;
  getActiveCargoCount(): Promise<number>;
  getTotalCargoCount(): Promise<number>;
  getCargoCountByUserId(userId: string): Promise<number>;

  getTruckListings(options?: { status?: string; limit?: number; offset?: number }): Promise<TruckListing[]>;
  getTruckListingsByUserId(userId: string): Promise<TruckListing[]>;
  getTruckListing(id: string): Promise<TruckListing | undefined>;
  createTruckListing(listing: InsertTruckListing, userId?: string): Promise<TruckListing>;
  getActiveTruckCount(): Promise<number>;
  getTotalTruckCount(): Promise<number>;
  getTruckCountByUserId(userId: string): Promise<number>;

  updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;

  deleteCargoListing(id: string): Promise<boolean>;
  deleteTruckListing(id: string): Promise<boolean>;
  incrementCargoViewCount(id: string): Promise<void>;
  updateCargoStatus(id: string, status: string, acceptedByUserId?: string): Promise<CargoListing | undefined>;
  updateCargoListing(id: string, data: Partial<CargoListing>): Promise<CargoListing | undefined>;
  getContractedCargoByUserId(userId: string): Promise<CargoListing[]>;

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
  getSeoArticlesByCategory(category: string): Promise<SeoArticle[]>;
  getPopularSeoArticles(limit?: number): Promise<SeoArticle[]>;
  getRelatedSeoArticles(articleId: string, category: string, limit?: number): Promise<SeoArticle[]>;
  incrementSeoArticleViewCount(id: string): Promise<void>;
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
  getNotificationTemplateByTrigger(channel: string, triggerEvent: string): Promise<NotificationTemplate | undefined>;
  createNotificationTemplate(data: InsertNotificationTemplate): Promise<NotificationTemplate>;
  updateNotificationTemplate(id: string, data: Partial<InsertNotificationTemplate & { isActive: boolean }>): Promise<NotificationTemplate | undefined>;
  deleteNotificationTemplate(id: string): Promise<boolean>;

  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date; used: boolean } | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;

  updateTruckListing(id: string, data: Partial<TruckListing>): Promise<TruckListing | undefined>;

  createAuditLog(log: { userId?: string; userName?: string; action: string; targetType: string; targetId?: string; details?: string; ipAddress?: string }): Promise<void>;
  getAuditLogs(limit?: number, offset?: number, filters?: { action?: string; targetType?: string; userId?: string }): Promise<AuditLog[]>;
  getAuditLogCount(filters?: { action?: string; targetType?: string; userId?: string }): Promise<number>;

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

  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  getAgentsByPrefecture(prefecture: string): Promise<Agent[]>;
  createAgent(data: InsertAgent): Promise<Agent>;
  updateAgent(id: string, data: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;
  getAgentStats(): Promise<Array<{
    agentId: string;
    userId: string;
    cargoCount: number;
    truckCount: number;
    completedCargoCount: number;
    completedTruckCount: number;
    activeCargoCount: number;
    activeTruckCount: number;
    totalCargoAmount: number;
    totalTruckAmount: number;
    completedCargoAmount: number;
    completedTruckAmount: number;
    recentCargo: Array<{ id: string; title: string; status: string; price: string | null; createdAt: Date }>;
    recentTrucks: Array<{ id: string; title: string; status: string; price: string | null; createdAt: Date }>;
  }>>;

  getYoutubeVideos(): Promise<YoutubeVideo[]>;
  getVisibleYoutubeVideos(limit?: number): Promise<YoutubeVideo[]>;
  upsertYoutubeVideo(data: InsertYoutubeVideo): Promise<YoutubeVideo>;
  deleteYoutubeVideo(id: string): Promise<boolean>;
  updateYoutubeVideoVisibility(id: string, isVisible: boolean): Promise<YoutubeVideo | undefined>;

  createYoutubeAutoPublishJob(data: { topic: string; status: string }): Promise<YoutubeAutoPublishJob>;
  getYoutubeAutoPublishJob(id: string): Promise<YoutubeAutoPublishJob | undefined>;
  getYoutubeAutoPublishJobs(limit?: number): Promise<YoutubeAutoPublishJob[]>;
  updateYoutubeAutoPublishJob(id: string, fields: Record<string, any>): Promise<void>;
  completeYoutubeAutoPublishJob(id: string): Promise<void>;
  getRecentAutoPublishTopics(days: number): Promise<string[]>;

  getEmailCampaigns(): Promise<EmailCampaign[]>;
  getEmailCampaign(id: string): Promise<EmailCampaign | undefined>;
  createEmailCampaign(data: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign | undefined>;
  deleteEmailCampaign(id: string): Promise<boolean>;

  getEmailLeads(status?: string, limit?: number, offset?: number): Promise<EmailLead[]>;
  getEmailLeadCount(status?: string): Promise<number>;
  getEmailLeadByEmail(email: string): Promise<EmailLead | undefined>;
  createEmailLead(data: InsertEmailLead): Promise<EmailLead>;
  createEmailLeads(data: InsertEmailLead[]): Promise<number>;
  updateEmailLead(id: string, data: Partial<EmailLead>): Promise<EmailLead | undefined>;
  deleteEmailLead(id: string): Promise<boolean>;
  getNewEmailLeadsForSending(limit: number): Promise<EmailLead[]>;
  getTodaySentLeadCount(): Promise<number>;
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
      "lineUserId", "notifySystem", "notifyEmail", "notifyLine", "role",
      "adminMemo", "lastLoginAt", "lastLoginIp", "lastLoginLocation"
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

  async getCargoListings(options?: { status?: string; limit?: number; offset?: number }): Promise<CargoListing[]> {
    const conditions = options?.status ? [eq(cargoListings.status, options.status)] : [];
    const query = db.select().from(cargoListings);
    const withWhere = conditions.length > 0 ? query.where(and(...conditions)) : query;
    const withOrder = withWhere.orderBy(desc(cargoListings.createdAt));
    if (options?.limit) {
      const withLimit = withOrder.limit(options.limit);
      if (options?.offset) return withLimit.offset(options.offset);
      return withLimit;
    }
    return withOrder;
  }

  async getCargoListingsByUserId(userId: string): Promise<CargoListing[]> {
    return db.select().from(cargoListings).where(eq(cargoListings.userId, userId)).orderBy(desc(cargoListings.createdAt));
  }

  async getActiveCargoCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(cargoListings).where(eq(cargoListings.status, "active"));
    return result[0]?.count ?? 0;
  }

  async getActiveTruckCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(truckListings).where(eq(truckListings.status, "active"));
    return result[0]?.count ?? 0;
  }

  async getTotalCargoCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(cargoListings);
    return result[0]?.count ?? 0;
  }

  async getTotalTruckCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(truckListings);
    return result[0]?.count ?? 0;
  }

  async getCargoCountByUserId(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(cargoListings).where(eq(cargoListings.userId, userId));
    return result[0]?.count ?? 0;
  }

  async getTruckCountByUserId(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(truckListings).where(eq(truckListings.userId, userId));
    return result[0]?.count ?? 0;
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

  async getTruckListings(options?: { status?: string; limit?: number; offset?: number }): Promise<TruckListing[]> {
    const conditions = options?.status ? [eq(truckListings.status, options.status)] : [];
    const query = db.select().from(truckListings);
    const withWhere = conditions.length > 0 ? query.where(and(...conditions)) : query;
    const withOrder = withWhere.orderBy(desc(truckListings.createdAt));
    if (options?.limit) {
      const withLimit = withOrder.limit(options.limit);
      if (options?.offset) return withLimit.offset(options.offset);
      return withLimit;
    }
    return withOrder;
  }

  async getTruckListingsByUserId(userId: string): Promise<TruckListing[]> {
    return db.select().from(truckListings).where(eq(truckListings.userId, userId)).orderBy(desc(truckListings.createdAt));
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

  async updateCargoStatus(id: string, status: string, acceptedByUserId?: string): Promise<CargoListing | undefined> {
    const setData: any = { status };
    if (acceptedByUserId) {
      setData.acceptedByUserId = acceptedByUserId;
    }
    if (status !== "completed") {
      setData.acceptedByUserId = null;
    }
    const [updated] = await db.update(cargoListings)
      .set(setData)
      .where(eq(cargoListings.id, id))
      .returning();
    return updated;
  }

  async getContractedCargoByUserId(userId: string): Promise<CargoListing[]> {
    return db.select().from(cargoListings)
      .where(eq(cargoListings.acceptedByUserId, userId));
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

  async getSeoArticlesByCategory(category: string): Promise<SeoArticle[]> {
    return db.select().from(seoArticles)
      .where(and(eq(seoArticles.status, "published"), eq(seoArticles.category, category)))
      .orderBy(desc(seoArticles.createdAt));
  }

  async getPopularSeoArticles(limit = 10): Promise<SeoArticle[]> {
    return db.select().from(seoArticles)
      .where(eq(seoArticles.status, "published"))
      .orderBy(desc(seoArticles.viewCount))
      .limit(limit);
  }

  async getRelatedSeoArticles(articleId: string, category: string, limit = 5): Promise<SeoArticle[]> {
    return db.select().from(seoArticles)
      .where(and(
        eq(seoArticles.status, "published"),
        eq(seoArticles.category, category),
        sql`${seoArticles.id} != ${articleId}`
      ))
      .orderBy(desc(seoArticles.viewCount))
      .limit(limit);
  }

  async incrementSeoArticleViewCount(id: string): Promise<void> {
    await db.update(seoArticles)
      .set({ viewCount: sql`COALESCE(${seoArticles.viewCount}, 0) + 1` })
      .where(eq(seoArticles.id, id));
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

  async getNotificationTemplateByTrigger(channel: string, triggerEvent: string): Promise<NotificationTemplate | undefined> {
    const [template] = await db.select().from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.channel, channel),
        eq(notificationTemplates.triggerEvent, triggerEvent),
        eq(notificationTemplates.isActive, true)
      ));
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

  async getAuditLogs(limit = 100, offset = 0, filters?: { action?: string; targetType?: string; userId?: string }): Promise<AuditLog[]> {
    const conditions = [];
    if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters?.targetType) conditions.push(eq(auditLogs.targetType, filters.targetType));
    if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
    const query = db.select().from(auditLogs);
    if (conditions.length > 0) {
      return query.where(and(...conditions)).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
    }
    return query.orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  }

  async getAuditLogCount(filters?: { action?: string; targetType?: string; userId?: string }): Promise<number> {
    const conditions = [];
    if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters?.targetType) conditions.push(eq(auditLogs.targetType, filters.targetType));
    if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
    const query = db.select({ count: sql<number>`count(*)::int` }).from(auditLogs);
    if (conditions.length > 0) {
      const [row] = await query.where(and(...conditions));
      return row?.count || 0;
    }
    const [row] = await query;
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

  async getAgents(): Promise<Agent[]> {
    return db.select().from(agents).orderBy(agents.prefecture, agents.companyName);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async getAgentsByPrefecture(prefecture: string): Promise<Agent[]> {
    return db.select().from(agents).where(eq(agents.prefecture, prefecture)).orderBy(agents.companyName);
  }

  async createAgent(data: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(data).returning();
    return agent;
  }

  async updateAgent(id: string, data: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [agent] = await db.update(agents).set(data).where(eq(agents.id, id)).returning();
    return agent;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAgentStats(): Promise<Array<{
    agentId: string;
    userId: string;
    cargoCount: number;
    truckCount: number;
    completedCargoCount: number;
    completedTruckCount: number;
    activeCargoCount: number;
    activeTruckCount: number;
    totalCargoAmount: number;
    totalTruckAmount: number;
    completedCargoAmount: number;
    completedTruckAmount: number;
    recentCargo: Array<{ id: string; title: string; status: string; price: string | null; createdAt: Date }>;
    recentTrucks: Array<{ id: string; title: string; status: string; price: string | null; createdAt: Date }>;
  }>> {
    const allAgents = await this.getAgents();
    const agentsWithAccounts = allAgents.filter(a => a.userId);
    if (agentsWithAccounts.length === 0) return [];

    const agentUserIds = agentsWithAccounts.map(a => a.userId!);

    const userIdCondition = sql.join(agentUserIds.map(id => sql`${id}`), sql`,`);

    const cargoStats = await db.execute(sql`
      SELECT user_id,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COALESCE(SUM(CASE WHEN price IS NOT NULL AND regexp_replace(price, '[^0-9]', '', 'g') != '' THEN regexp_replace(price, '[^0-9]', '', 'g')::bigint ELSE 0 END), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'completed' AND price IS NOT NULL AND regexp_replace(price, '[^0-9]', '', 'g') != '' THEN regexp_replace(price, '[^0-9]', '', 'g')::bigint ELSE 0 END), 0) as completed_amount
      FROM cargo_listings
      WHERE user_id IN (${userIdCondition})
      GROUP BY user_id
    `);

    const truckStats = await db.execute(sql`
      SELECT user_id,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COALESCE(SUM(CASE WHEN price IS NOT NULL AND regexp_replace(price, '[^0-9]', '', 'g') != '' THEN regexp_replace(price, '[^0-9]', '', 'g')::bigint ELSE 0 END), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'completed' AND price IS NOT NULL AND regexp_replace(price, '[^0-9]', '', 'g') != '' THEN regexp_replace(price, '[^0-9]', '', 'g')::bigint ELSE 0 END), 0) as completed_amount
      FROM truck_listings
      WHERE user_id IN (${userIdCondition})
      GROUP BY user_id
    `);

    const recentCargoRows = await db.execute(sql`
      SELECT id, title, status, price, created_at, user_id
      FROM (
        SELECT id, title, status, price, created_at, user_id,
          ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
        FROM cargo_listings
        WHERE user_id IN (${userIdCondition})
      ) sub
      WHERE rn <= 5
    `);

    const recentTruckRows = await db.execute(sql`
      SELECT id, title, status, price, created_at, user_id
      FROM (
        SELECT id, title, status, price, created_at, user_id,
          ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
        FROM truck_listings
        WHERE user_id IN (${userIdCondition})
      ) sub
      WHERE rn <= 5
    `);

    const cargoStatsMap: Record<string, any> = {};
    (cargoStats.rows as any[]).forEach(r => { cargoStatsMap[r.user_id] = r; });

    const truckStatsMap: Record<string, any> = {};
    (truckStats.rows as any[]).forEach(r => { truckStatsMap[r.user_id] = r; });

    const recentCargoMap: Record<string, any[]> = {};
    (recentCargoRows.rows as any[]).forEach(r => {
      if (!recentCargoMap[r.user_id]) recentCargoMap[r.user_id] = [];
      recentCargoMap[r.user_id].push(r);
    });

    const recentTruckMap: Record<string, any[]> = {};
    (recentTruckRows.rows as any[]).forEach(r => {
      if (!recentTruckMap[r.user_id]) recentTruckMap[r.user_id] = [];
      recentTruckMap[r.user_id].push(r);
    });

    return agentsWithAccounts.map(agent => {
      const cs = cargoStatsMap[agent.userId!];
      const ts = truckStatsMap[agent.userId!];

      return {
        agentId: agent.id,
        userId: agent.userId!,
        cargoCount: Number(cs?.total_count ?? 0),
        truckCount: Number(ts?.total_count ?? 0),
        completedCargoCount: Number(cs?.completed_count ?? 0),
        completedTruckCount: Number(ts?.completed_count ?? 0),
        activeCargoCount: Number(cs?.active_count ?? 0),
        activeTruckCount: Number(ts?.active_count ?? 0),
        totalCargoAmount: Number(cs?.total_amount ?? 0),
        totalTruckAmount: Number(ts?.total_amount ?? 0),
        completedCargoAmount: Number(cs?.completed_amount ?? 0),
        completedTruckAmount: Number(ts?.completed_amount ?? 0),
        recentCargo: (recentCargoMap[agent.userId!] ?? []).map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          price: c.price,
          createdAt: c.created_at,
        })),
        recentTrucks: (recentTruckMap[agent.userId!] ?? []).map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          price: t.price,
          createdAt: t.created_at,
        })),
      };
    });
  }

  async getAiTrainingExamples(category?: string): Promise<AiTrainingExample[]> {
    if (category) {
      return db.select().from(aiTrainingExamples).where(and(eq(aiTrainingExamples.category, category), eq(aiTrainingExamples.isActive, true))).orderBy(desc(aiTrainingExamples.createdAt));
    }
    return db.select().from(aiTrainingExamples).orderBy(desc(aiTrainingExamples.createdAt));
  }

  async getAllAiTrainingExamples(): Promise<AiTrainingExample[]> {
    return db.select().from(aiTrainingExamples).orderBy(desc(aiTrainingExamples.createdAt));
  }

  async createAiTrainingExample(example: InsertAiTrainingExample): Promise<AiTrainingExample> {
    const [created] = await db.insert(aiTrainingExamples).values(example).returning();
    return created;
  }

  async updateAiTrainingExample(id: string, data: Partial<InsertAiTrainingExample & { isActive: boolean }>): Promise<AiTrainingExample | undefined> {
    const [updated] = await db.update(aiTrainingExamples).set(data).where(eq(aiTrainingExamples.id, id)).returning();
    return updated;
  }

  async deleteAiTrainingExample(id: string): Promise<boolean> {
    const result = await db.delete(aiTrainingExamples).where(eq(aiTrainingExamples.id, id));
    return true;
  }

  async incrementAiTrainingUseCount(id: string): Promise<void> {
    await db.update(aiTrainingExamples).set({ useCount: sql`${aiTrainingExamples.useCount} + 1` }).where(eq(aiTrainingExamples.id, id));
  }

  async getAiCorrectionLogs(limit = 50): Promise<AiCorrectionLog[]> {
    return db.select().from(aiCorrectionLogs).orderBy(desc(aiCorrectionLogs.createdAt)).limit(limit);
  }

  async createAiCorrectionLog(log: InsertAiCorrectionLog): Promise<AiCorrectionLog> {
    const [created] = await db.insert(aiCorrectionLogs).values(log).returning();
    return created;
  }

  async promoteAiCorrectionToExample(id: string): Promise<AiTrainingExample | undefined> {
    const [log] = await db.select().from(aiCorrectionLogs).where(eq(aiCorrectionLogs.id, id));
    if (!log) return undefined;
    const example = await this.createAiTrainingExample({
      category: log.category,
      inputText: log.originalInput,
      expectedOutput: log.correctedOutput,
      note: `自動昇格: ${log.correctedFields || '修正データ'}`,
      isActive: true,
      createdBy: log.userId,
    });
    await db.update(aiCorrectionLogs).set({ promoted: true }).where(eq(aiCorrectionLogs.id, id));
    return example;
  }

  async deleteAiCorrectionLog(id: string): Promise<boolean> {
    await db.delete(aiCorrectionLogs).where(eq(aiCorrectionLogs.id, id));
    return true;
  }

  async getYoutubeVideos(): Promise<YoutubeVideo[]> {
    return db.select().from(youtubeVideos).orderBy(desc(youtubeVideos.publishedAt));
  }

  async getVisibleYoutubeVideos(limit = 6): Promise<YoutubeVideo[]> {
    return db.select().from(youtubeVideos)
      .where(eq(youtubeVideos.isVisible, true))
      .orderBy(desc(youtubeVideos.publishedAt))
      .limit(limit);
  }

  async upsertYoutubeVideo(data: InsertYoutubeVideo): Promise<YoutubeVideo> {
    const existing = await db.select().from(youtubeVideos).where(eq(youtubeVideos.videoId, data.videoId));
    if (existing.length > 0) {
      const [updated] = await db.update(youtubeVideos)
        .set({ ...data, fetchedAt: new Date() })
        .where(eq(youtubeVideos.videoId, data.videoId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(youtubeVideos).values(data).returning();
    return created;
  }

  async deleteYoutubeVideo(id: string): Promise<boolean> {
    await db.delete(youtubeVideos).where(eq(youtubeVideos.id, id));
    return true;
  }

  async updateYoutubeVideoVisibility(id: string, isVisible: boolean): Promise<YoutubeVideo | undefined> {
    const [updated] = await db.update(youtubeVideos)
      .set({ isVisible })
      .where(eq(youtubeVideos.id, id))
      .returning();
    return updated;
  }

  async createYoutubeAutoPublishJob(data: { topic: string; status: string }): Promise<YoutubeAutoPublishJob> {
    const [job] = await db.insert(youtubeAutoPublishJobs)
      .values({ topic: data.topic, status: data.status })
      .returning();
    return job;
  }

  async getYoutubeAutoPublishJob(id: string): Promise<YoutubeAutoPublishJob | undefined> {
    const [job] = await db.select().from(youtubeAutoPublishJobs).where(eq(youtubeAutoPublishJobs.id, id));
    return job;
  }

  async getYoutubeAutoPublishJobs(limit = 50): Promise<YoutubeAutoPublishJob[]> {
    return db.select().from(youtubeAutoPublishJobs).orderBy(desc(youtubeAutoPublishJobs.createdAt)).limit(limit);
  }

  async updateYoutubeAutoPublishJob(id: string, fields: Record<string, any>): Promise<void> {
    await db.update(youtubeAutoPublishJobs).set(fields).where(eq(youtubeAutoPublishJobs.id, id));
  }

  async completeYoutubeAutoPublishJob(id: string): Promise<void> {
    await db.update(youtubeAutoPublishJobs)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(youtubeAutoPublishJobs.id, id));
  }

  async getRecentAutoPublishTopics(days: number): Promise<string[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const jobs = await db.select({ topic: youtubeAutoPublishJobs.topic })
      .from(youtubeAutoPublishJobs)
      .where(gte(youtubeAutoPublishJobs.createdAt, since));
    return jobs.map((j) => j.topic);
  }

  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt));
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id));
    return campaign;
  }

  async createEmailCampaign(data: InsertEmailCampaign): Promise<EmailCampaign> {
    const [campaign] = await db.insert(emailCampaigns).values(data).returning();
    return campaign;
  }

  async updateEmailCampaign(id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.update(emailCampaigns).set(data).where(eq(emailCampaigns.id, id)).returning();
    return campaign;
  }

  async deleteEmailCampaign(id: string): Promise<boolean> {
    const result = await db.delete(emailCampaigns).where(eq(emailCampaigns.id, id));
    return true;
  }

  async getEmailLeads(status?: string, limit = 100, offset = 0): Promise<EmailLead[]> {
    if (status) {
      return db.select().from(emailLeads).where(eq(emailLeads.status, status)).orderBy(desc(emailLeads.createdAt)).limit(limit).offset(offset);
    }
    return db.select().from(emailLeads).orderBy(desc(emailLeads.createdAt)).limit(limit).offset(offset);
  }

  async getEmailLeadCount(status?: string): Promise<number> {
    const condition = status ? eq(emailLeads.status, status) : undefined;
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(emailLeads).where(condition);
    return result?.count || 0;
  }

  async getEmailLeadByEmail(email: string): Promise<EmailLead | undefined> {
    const [lead] = await db.select().from(emailLeads).where(eq(emailLeads.email, email));
    return lead;
  }

  async createEmailLead(data: InsertEmailLead): Promise<EmailLead> {
    const [lead] = await db.insert(emailLeads).values(data).returning();
    return lead;
  }

  async createEmailLeads(data: InsertEmailLead[]): Promise<number> {
    if (data.length === 0) return 0;
    const result = await db.insert(emailLeads).values(data).onConflictDoNothing().returning();
    return result.length;
  }

  async updateEmailLead(id: string, data: Partial<EmailLead>): Promise<EmailLead | undefined> {
    const [lead] = await db.update(emailLeads).set(data).where(eq(emailLeads.id, id)).returning();
    return lead;
  }

  async deleteEmailLead(id: string): Promise<boolean> {
    await db.delete(emailLeads).where(eq(emailLeads.id, id));
    return true;
  }

  async getNewEmailLeadsForSending(limit: number): Promise<EmailLead[]> {
    return db.select().from(emailLeads)
      .where(and(eq(emailLeads.status, "new"), sql`${emailLeads.email} IS NOT NULL AND ${emailLeads.email} != ''`))
      .orderBy(emailLeads.createdAt)
      .limit(limit);
  }

  async getTodaySentLeadCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(emailLeads)
      .where(and(eq(emailLeads.status, "sent"), gte(emailLeads.sentAt, today)));
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();
