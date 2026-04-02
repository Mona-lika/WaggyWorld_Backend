import express from "express";
import { db } from "../config/db.js";
import { pets, users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// --- 1. POST: ADD A NEW PET ---
router.post("/add", async (req, res) => {
    console.log("RECEIVING DATA FROM PHONE:", req.body);

    try {
        const imagesArray = Array.isArray(req.body.images) ? req.body.images : [];

        const newPet = await db.insert(pets).values({
            name: req.body.name,
            species: req.body.species,
            breed: req.body.breed,
            age: req.body.age,
            gender: req.body.gender,
            description: req.body.description,
            vaccinated: req.body.vaccinated,
            neutered: req.body.neutered,
            dewormed: req.body.dewormed,
            medicalIssues: req.body.medicalIssues,
            temperament: req.body.temperament,
            goodWithKids: req.body.goodWithKids,
            goodWithPets: req.body.goodWithPets,
            location: req.body.location,
            adoptionFee: req.body.adoptionFee,
            availableFrom: req.body.availableFrom,
            shelterId: req.body.shelterId,
            imageUrl: imagesArray, // THIS IS THE FIX
            status: "available"
        }).returning();

        console.log("✅ New Pet Added:", newPet[0].name);
        res.status(201).json(newPet[0]);
    } catch (error) {
        console.error("Pet Add Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- 2. GET: ALL PETS + SHELTER INFO (User side) ---// 
router.get("/all", async (req, res) => {
    console.log("[PETS] Fetching all pets with Shelter info...");
    try {
        const allData = await db.select({
            pet: pets,
            shelterName: users.name, // Join to get the actual Shelter Name
        })
        .from(pets)
        .leftJoin(users, eq(pets.shelterId, users.id))
        .where(eq(pets.status, "available")); // Only show pets that haven't been adopted

        // Map the results to ensure imageUrl is never null for the frontend
        const safeData = allData.map(item => {
            if (!item.pet) return null; // Skip if pet is missing

            return {
                shelterName: item.shelterName || "Unknown Shelter",
                pet: {
                    ...item.pet,
                    // Use optional chaining ?. to prevent the "null to object" error
                    imageUrl: item.pet?.image_url || item.pet?.imageUrl || []
                }
            };
        }).filter(item => item !== null); // Remove any empty items

        res.status(200).json(safeData);
    } catch (error) {
        console.error("❌ FETCH ALL ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// GET SINGLE PET DETAILS + SHELTER INFO
// This handles: GET http://localhost:5001/api/pets/3
router.get("/:id", async (req, res) => {
    const petId = parseInt(req.params.id);
    console.log(`[PETS] Fetching details for Pet ID: ${petId}`);

    try {
        const result = await db.select({
            pet: pets,
            shelterName: users.name,
            shelterEmail: users.email
        })
        .from(pets)
        .leftJoin(users, eq(pets.shelterId, users.id))
        .where(eq(pets.id, petId));

        if (result.length === 0) {
            return res.status(404).json({ error: "Pet not found" });
        }

        // Map data so frontend always sees 'imageUrl' as an array
        const safeData = {
            ...result[0],
            pet: {
                ...result[0].pet,
                imageUrl: result[0].pet.image_url || result[0].pet.imageUrl || []
            }
        };

        res.status(200).json(safeData);
    } catch (error) {
        console.error("❌ Single Pet Fetch Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get pets belonging to ONE specific shelter
router.get("/shelter/:id", async (req, res) => {
    const shelterId = parseInt(req.params.id);
    console.log(`[PETS] Fetching for shelter: ${shelterId}`);
    try {
        const myPets = await db.select()
            .from(pets)
            .where(eq(pets.shelterId, shelterId));
        res.status(200).json(myPets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;