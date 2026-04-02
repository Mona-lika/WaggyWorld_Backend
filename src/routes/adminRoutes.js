import express from "express";
import { db } from "../config/db.js";
import { users, pets, adoptionApplications } from "../db/schema.js";
import { sql, desc, eq } from "drizzle-orm";

const router = express.Router();

router.get("/overview", async (req, res) => {
    try {
        // 1. Get Totals
        const userCount = await db.select({ count: sql`count(*)` }).from(users);
        const petCount = await db.select({ count: sql`count(*)` }).from(pets);
        const appCount = await db.select({ count: sql`count(*)` }).from(adoptionApplications);
        
        // 2. Get Recent Applications
        const recentApps = await db.select({
            id: adoptionApplications.id,
            userName: users.name,
            petName: pets.name,
            status: adoptionApplications.status
        })
        .from(adoptionApplications)
        .leftJoin(users, eq(adoptionApplications.adopterId, users.id))
        .leftJoin(pets, eq(adoptionApplications.petId, pets.id))
        .orderBy(desc(adoptionApplications.createdAt))
        .limit(5);

        res.json({
            stats: {
                users: userCount[0].count,
                pets: petCount[0].count,
                apps: appCount[0].count,
                health: 124 // Placeholder for now
            },
            recentApps
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;