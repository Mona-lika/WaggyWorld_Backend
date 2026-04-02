import express from "express";
import { db } from "../config/db.js";
import { myPets } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

router.post("/add-pet", async (req, res) => {
    console.log("--- Saving Pet to Postgres ---");
    console.log("Data:", req.body.name);

    try {
        const newPet = await db.insert(myPets).values({
            userId: Number(req.body.userId),
            name: req.body.name,
            species: req.body.species,
            breed: req.body.breed,
            gender: req.body.gender,
            age: req.body.age,
            weight: req.body.weight,
            imageUrl: req.body.imageUrl,
            // Medical Info
            lastVaccine: req.body.lastVaccine,
            nextVaccine: req.body.nextVaccine,
            lastVetVisit: req.body.lastVetVisit,
            nextVetVisit: req.body.nextVetVisit,
            allergies: req.body.allergies,
            medicalConditions: req.body.medicalConditions,
            neutered: req.body.neutered,
            // Preferences & Sharing
            allowNotifications: req.body.allowNotifications === 'Yes' ? true : false,
            caretakerEmail: req.body.caretakerEmail || null,
            inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        }).returning();

        res.status(201).json(newPet[0]);
    } catch (error) {
        console.error("Save Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get("/my-pets/:userId", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const pets = await db.select().from(myPets).where(eq(myPets.userId, userId));
        
        // This log is important! Check it in your terminal
        console.log(`[DATABASE] Found ${pets.length} pets for user ${userId}`);
        
        res.status(200).json(pets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;