import express from "express";
import { db } from "../config/db.js";
import { adoptionApplications, pets, users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

router.post("/submit", async (req, res) => {
    console.log("--- Processing Application for", req.body.fullName, "---");

    try {
        const newApp = await db.insert(adoptionApplications).values({
            // IDs
            petId: Number(req.body.petId),
            adopterId: Number(req.body.adopterId),
            shelterId: Number(req.body.shelterId),
            
            // Personal Info
            fullName: req.body.fullName,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,

            // Living Situation
            homeType: req.body.homeType,
            isOwner: req.body.isOwner,
            landlordPermission: req.body.landlordPermission, // ADDED
            hasYard: req.body.hasYard,

            // Experience
            pastExperience: req.body.pastExperience,
            hasCurrentPets: req.body.hasCurrentPets, // ADDED
            currentPetsStatus: req.body.currentPetsStatus, // ADDED

            // Availability
            aloneHours: req.body.aloneHours,
            primaryCaretaker: req.body.primaryCaretaker, // ADDED
            
            status: "pending"
        }).returning();

        console.log("✅ Success: Application saved for pet ID:", req.body.petId);
        res.status(201).json(newApp[0]);
    } catch (error) {
        console.error("❌ SQL ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 2. GET APPLICATIONS FOR A SPECIFIC SHELTER
router.get("/shelter/:id", async (req, res) => {
    const shelterId = parseInt(req.params.id);
    console.log(`[APPS] Fetching applications for Shelter ID: ${shelterId}`);
    try {
        const apps = await db.select({
            id: adoptionApplications.id,
            petName: pets.name,
            petImage: pets.imageUrl,
            adopterName: users.name,
            status: adoptionApplications.status,
            createdAt: adoptionApplications.createdAt,
            visitDate: adoptionApplications.visitDate,
            rejectionReason: adoptionApplications.rejectionReason,
        })
        .from(adoptionApplications)
        .leftJoin(pets, eq(adoptionApplications.petId, pets.id))
        .leftJoin(users, eq(adoptionApplications.adopterId, users.id))
        .where(eq(adoptionApplications.shelterId, shelterId));

        res.status(200).json(apps);
    } catch (error) {
        console.error("Fetch Apps Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 3. GET APPLICATIONS FOR A SPECIFIC USER (Adopter side)
router.get("/user/:id", async (req, res) => {
    const adopterId = parseInt(req.params.id);
    try {
        const apps = await db.select({
            id: adoptionApplications.id,
            status: adoptionApplications.status,
            createdAt: adoptionApplications.createdAt,
            visitDate: adoptionApplications.visitDate,
            rejectionReason: adoptionApplications.rejectionReason,
            petName: pets.name,
            petBreed: pets.breed,
            petImage: pets.imageUrl, // Array from schema
            shelterName: users.name,
        })
        .from(adoptionApplications)
        .leftJoin(pets, eq(adoptionApplications.petId, pets.id))
        .leftJoin(users, eq(adoptionApplications.shelterId, users.id))
        .where(eq(adoptionApplications.adopterId, adopterId));

        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. UPDATE STATUS (Approve/Reject)
router.put("/status/:id", async (req, res) => {
    const appId = Number(req.params.id);
    const { status, rejectionReason, visitDate } = req.body;
    try {
        await db.update(adoptionApplications)
            .set({ 
                status,
                rejectionReason: rejectionReason || null, 
                visitDate: visitDate || null 
             })
            .where(eq(adoptionApplications.id, parseInt(req.params.id)));
        res.status(200).json({ message: `Application ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET SINGLE APPLICATION DETAILS (for Review)
router.get("/review/:id", async (req, res) => {
    const appId = parseInt(req.params.id);
    try {
        const result = await db.select({
            application: adoptionApplications,
            petName: pets.name,
            petBreed: pets.breed,
            petImage: pets.imageUrl,
            adopterName: users.name,
            adopterEmail: users.email
        })
        .from(adoptionApplications)
        .leftJoin(pets, eq(adoptionApplications.petId, pets.id))
        .leftJoin(users, eq(adoptionApplications.adopterId, users.id))
        .where(eq(adoptionApplications.id, appId));

        if (result.length === 0) return res.status(404).json({ error: "Application not found" });
        res.status(200).json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;