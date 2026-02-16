import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCargoListingSchema, insertTruckListingSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/cargo", async (_req, res) => {
    try {
      const listings = await storage.getCargoListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cargo listings" });
    }
  });

  app.get("/api/cargo/:id", async (req, res) => {
    try {
      const listing = await storage.getCargoListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Cargo listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cargo listing" });
    }
  });

  app.post("/api/cargo", async (req, res) => {
    try {
      const parsed = insertCargoListingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const listing = await storage.createCargoListing(parsed.data);
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create cargo listing" });
    }
  });

  app.delete("/api/cargo/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCargoListing(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Cargo listing not found" });
      }
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cargo listing" });
    }
  });

  app.get("/api/trucks", async (_req, res) => {
    try {
      const listings = await storage.getTruckListings();
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck listings" });
    }
  });

  app.get("/api/trucks/:id", async (req, res) => {
    try {
      const listing = await storage.getTruckListing(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: "Truck listing not found" });
      }
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch truck listing" });
    }
  });

  app.post("/api/trucks", async (req, res) => {
    try {
      const parsed = insertTruckListingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const listing = await storage.createTruckListing(parsed.data);
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create truck listing" });
    }
  });

  app.delete("/api/trucks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTruckListing(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Truck listing not found" });
      }
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete truck listing" });
    }
  });

  return httpServer;
}
