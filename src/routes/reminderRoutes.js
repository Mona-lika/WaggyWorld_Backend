import express from "express";
import { db } from "../config/db.js";
import { petReminders } from "../db/schema.js";

const router = express.Router();

router.post("/add", async (req, res) => {
    try {
        const { petId, userId, title, type, reminderDate } = req.body;
        await db.insert(petReminders).values({
            petId,
            userId,
            title,
            type,
            reminderDate: new Date(reminderDate),
        });
        res.status(201).json({ message: "Reminder scheduled successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;