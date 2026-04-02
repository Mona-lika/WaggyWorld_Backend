import express from "express";
import { ENV } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import petRoutes from "./routes/petRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import trackerRoutes from "./routes/trackerRoutes.js";
import { upload } from './config/cloudinary.js';

const app = express();
const PORT = ENV.PORT || 5001;

app.use(cors({
  origin: "*", // Allow every connection (including your local web browser)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Log requests to terminal (Helpful for your presentation)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} to ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/applications", applicationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/tracker", trackerRoutes);

// Route to handle image upload
app.post('/api/upload', upload.any(), (req, res) => {
  console.log("--- API UPLOAD HIT ---");
  try {
    if (!req.files || req.files.length === 0) {
        console.log("❌ No files in req.files");
        return res.status(400).json({ error: "No file uploaded" });
    }

    // Capture the first file path
    const fileUrl = req.files[0].path;
    const allUrls = req.files.map(f => f.path);

    console.log("✅ Cloudinary Success:", fileUrl);

    res.status(200).json({ 
      url: fileUrl, 
      urls: allUrls 
    });
  } catch (error) {
    console.error("❌ Cloudinary Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log("Server is running on PORT:", PORT);
  console.log(`🚀 API: http://localhost:${PORT}/api/auth`);
});
