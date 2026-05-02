import express from "express";
import crypto from "crypto";

const router = express.Router();

router.post("/create-signature", (req, res) => {
    const { amount, transaction_uuid } = req.body;
    const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
    const productCode = "EPAYTEST";

    // eSewa Requirement: amount,transaction_uuid,product_code
   const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${productCode}`;
    
    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(message)
        .digest("base64");

    res.json({ signature, productCode });
});

export default router;