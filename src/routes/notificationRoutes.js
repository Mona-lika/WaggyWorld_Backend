import express from "express";
import { db } from "../config/db.js";
import { notifications } from "../db/schema.js";
import { eq, desc, and, count } from "drizzle-orm";

const router = express.Router();

// 1. Get all notifications for a user
router.get("/:userId", async (req, res) => {
    try {
        const data = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, parseInt(req.params.userId)))
            .orderBy(desc(notifications.createdAt));
        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Get unread count (for the BottomNav badge)
router.get("/unread-count/:userId", async (req, res) => {
    try {
        const result = await db.select({ value: count() })
            .from(notifications)
            .where(and(
                eq(notifications.userId, parseInt(req.params.userId)),
                eq(notifications.isRead, false)
            ));
        res.status(200).json({ count: result[0].value });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 3. Mark notification as read
router.put("/read/:id", async (req, res) => {
    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, parseInt(req.params.id)));
        res.status(200).json({ message: "Marked as read" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ROUTE TO SEND NOTIFICATION TO EVERYONE (Broadcast)
router.post("/broadcast", async (req, res) => {
    try {
        const { title, message } = req.body;

        // 1. Get all user IDs from the database
        const allUsers = await db.select({ id: users.id }).from(users);

        // 2. Create notification entries for every single user
        const broadcastData = allUsers.map(u => ({
            userId: u.id,
            title: title, // e.g. "WaggyWorld Event"
            message: message, // e.g. "Adoption Fair this Saturday!"
            type: "invite",
            isRead: false
        }));

        await db.insert(notifications).values(broadcastData);

        res.status(201).json({ message: `Broadcast sent to ${allUsers.length} users.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;