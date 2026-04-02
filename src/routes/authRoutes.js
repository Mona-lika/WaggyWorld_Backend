import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js"; 
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();
const JWT_SECRET = "MonalikaProjectSecretKey123"; 

// REGISTER (Signup)
router.post("/register", async (req, res) => {
    console.log("--- New Signup Attempt ---");
    console.log("Data received from phone:", req.body);

    const { name, email, password, role } = req.body;
    try {
      if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email already exists 
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("Signup Blocked: Email already exists in Postgres");
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role || "user"
      }).returning();

        console.log("✅ User created successfully in DB:", newUser[0].email);
        res.status(201).json(newUser[0]);

    } catch (error) {
        console.error("❌ REGISTER ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});
        
// --- 2. LOGIN ---
router.post("/login", async (req, res) => {
    console.log("--- New Login Attempt ---");
    const { email, password } = req.body;

    try {
        // Find user by email
        const userArray = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = userArray[0];

        if (!user) {
            console.log("Login Failed: User not found");
            return res.status(404).json({ error: "User not found" });
        }

        // Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Login Failed: Wrong password");
            return res.status(401).json({ error: "Wrong password" });
        }

        // Generate Token including the ROLE
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        console.log(`✅ Login Success! Role: ${user.role}`);
        
        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isNew: user.isNew
            }
        });

    } catch (error) {
        console.error("❌ LOGIN ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }   
});

// --- 3. ONBOARDING (NEW ROUTE) ---
// This turns off the 'isNew' flag once the user clicks "Get Started"
router.put("/select-role", async (req, res) => {
    const { userId, role } = req.body;
    console.log("Updating role for user:", userId, "to:", role);

    try {
        await db.update(users)
        .set({ 
                role: role,    // Change to 'user' or 'shelter'
                isNew: false   // Mark as no longer new
            })
        .where(eq(users.id, userId));
        res.status(200).json({ message: "Onboarding complete" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// --- 4. FORGOT PASSWORD (STUB) ---
router.post("/forgotPassword", async (req, res) => {
    const { email } = req.body;
    console.log(`[AUTH] Password reset requested for: ${email}`);
    // For FYP Demo: We just simulate success. 
    // Real production would use NodeMailer here.
    res.status(200).json({ message: "Reset link sent" });
});

// --- 5. SOCIAL LOGIN (STUBS) ---
// These allow your frontend buttons to talk to the backend without crashing
router.post("/google-login", async (req, res) => {
    res.status(200).json({ message: "Google logic pending configuration" });
});

router.post("/apple-login", async (req, res) => {
    res.status(200).json({ message: "Apple logic pending configuration" });
});

export default router;