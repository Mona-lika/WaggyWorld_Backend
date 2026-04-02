import express from "express";
import { db } from "../config/db.js";
import { donations, users, supplyBookings } from "../db/schema.js"; 
import { eq } from "drizzle-orm"; // Fixed import

const router = express.Router();

// 1. GET ALL POSTS + SHELTER NAME
router.get("/all", async (req, res) => {
    console.log("[DONATIONS] Fetching all campaigns for Adopters...");
    try {
        const allData = await db.select({
            id: donations.id,
            title: donations.title,
            description: donations.description,
            imageUrl: donations.imageUrls || donations.imageUrl,
            createdAt: donations.createdAt,
            shelterName: users.name, 
        })
        .from(donations)
        .leftJoin(users, eq(donations.shelterId, users.id));

        res.status(200).json(allData || []);
    } catch (error) {
        console.error("❌ Donation Fetch Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. CREATE DONATION POST
router.post("/add", async (req, res) => {
    console.log("Donation Data Received:", req.body);
    try {
        const photos = Array.isArray(req.body.images) ? req.body.images : [];

        const newDonation = await db.insert(donations).values({
            title: req.body.title,
            description: req.body.description,
            shelterId: req.body.shelterId,
            donationType: req.body.donationType,
            targetAmount: req.body.targetAmount,
            suppliesCategory: req.body.suppliesCategory,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            imageUrls: photos // Maps the frontend 'images' array to 'image_urls'
        }).returning();

        res.status(201).json(newDonation[0]);
    } catch (error) {
        console.error("❌ Donation Add Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET SINGLE DONATION DETAILS
router.get("/:id", async (req, res) => {
    try {
        const donId = parseInt(req.params.id);
        const result = await db.select({
            donation: donations,
            shelterName: users.name,
            shelterLocation: users.email // You can change this to a location field if you have one
        })
        .from(donations)
        .leftJoin(users, eq(donations.shelterId, users.id))
        .where(eq(donations.id, donId));

        if (result.length === 0) return res.status(404).json({ error: "Campaign not found" });
        res.status(200).json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BOOK A SUPPLY DROP-OFF
router.post("/book-supply", async (req, res) => {
    console.log("--- New Supply Booking Request ---");
    console.log("Data:", req.body);
    try {
        const newBooking = await db.insert(supplyBookings).values({
            donationId: Number(req.body.donationId),
            userId: Number(req.body.userId),
            dropoffDate: req.body.dropoffDate,
            status: "pending"
        }).returning();

        console.log("✅ Success: Booking saved for donation:", req.body.donationId);
        res.status(201).json(newBooking[0]);
    } catch (error) {
        console.error("❌ BOOKING ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;