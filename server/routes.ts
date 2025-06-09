import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBrandGuideSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Brand guide routes
  app.get("/api/brand-guides/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const guide = await storage.getBrandGuide(sessionId);
      
      if (!guide) {
        return res.status(404).json({ error: "Brand guide not found" });
      }
      
      res.json(guide);
    } catch (error) {
      console.error("Error fetching brand guide:", error);
      res.status(500).json({ error: "Failed to fetch brand guide" });
    }
  });

  app.post("/api/brand-guides", async (req, res) => {
    try {
      const validatedData = insertBrandGuideSchema.parse(req.body);
      const guide = await storage.saveBrandGuide(validatedData);
      res.json(guide);
    } catch (error) {
      console.error("Error saving brand guide:", error);
      res.status(400).json({ error: "Failed to save brand guide" });
    }
  });

  app.put("/api/brand-guides/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { guideData } = req.body;
      
      const updatedGuide = await storage.updateBrandGuide(id, guideData);
      
      if (!updatedGuide) {
        return res.status(404).json({ error: "Brand guide not found" });
      }
      
      res.json(updatedGuide);
    } catch (error) {
      console.error("Error updating brand guide:", error);
      res.status(500).json({ error: "Failed to update brand guide" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
