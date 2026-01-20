import express from "express";
import {ENV} from "./libs/env.js";
import path from "path";
import { fileURLToPath } from 'url';
import { serve } from "inngest/express";
import { inngest, functions } from "./libs/inngest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(ENV.PORT)
console.log(ENV.DB_URL)

const app = express();

// Clerk webhook handler - MUST come before express.json()
app.post("/api/webhooks/clerk", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        console.log("📨 Clerk webhook received");
        
        const payload = JSON.parse(req.body.toString());
        const eventType = payload.type;
        
        console.log("Event type:", eventType);
        
        // Send to Inngest
        if (eventType === "user.created") {
            console.log("👤 Sending user.created to Inngest...");
            await inngest.send({
                name: "clerk/user.created",
                data: payload.data
            });
            console.log("✅ Event sent to Inngest!");
        }
        
        if (eventType === "user.deleted") {
            console.log("🗑️  Sending user.deleted to Inngest...");
            await inngest.send({
                name: "clerk/user.deleted",
                data: payload.data
            });
            console.log("✅ Event sent to Inngest!");
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error("❌ Webhook error:", error);
        res.status(400).json({ error: error.message });
    }
});

// Regular JSON parsing
app.use(express.json());

// API routes
app.get("/health", (req, res) => {
    res.json({msg: "health ok"});
});

app.get("/books", (req, res) => {
    res.json({msg: "books ok"});
});

app.get("/store", (req, res) => {
    res.json({msg: "store ok"});
});

// Inngest endpoint
app.use("/api/inngest", serve({
    client: inngest,
    functions: functions,
}));

// Static files
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../../frontend/dist")));
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({msg: "development mode"});
    });
}

app.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`);
});