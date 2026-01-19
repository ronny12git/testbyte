import express from "express";
import {ENV} from "./libs/env.js";
import path from "path";
import { fileURLToPath } from 'url';
import { handleClerkWebhook } from "./controllers/clerkWebhook.controller.js";
import { connectDB } from "./libs/db.js";
import { inngestServe } from "./libs/inngest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(ENV.PORT)
console.log(ENV.DB_URL)

// Connect to MongoDB
connectDB();

const app = express();

// IMPORTANT: Clerk webhook needs raw body BEFORE express.json()
app.post("/api/webhooks/clerk", express.raw({ type: 'application/json' }), handleClerkWebhook);

// Regular JSON parsing for other routes
app.use(express.json());

// ===== API ROUTES - THESE MUST COME BEFORE STATIC FILES =====
app.get("/health", (req,res) => {
    res.status(200).json({msg:"success at health endpoint"});
})

app.get("/books", (req,res) => {
    res.status(200).json({msg:"success at books endpoint"});
})

app.get("/store", (req,res) => {
    res.status(200).json({msg:"success at store endpoint"});
})

// Inngest endpoint - MUST come before static files
app.use("/api/inngest", inngestServe);

// ===== STATIC FILES & CATCH-ALL (MUST BE LAST) =====
if(ENV.NODE_ENV === "production"){
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname,"../../frontend/dist")));

    // Catch-all route for React Router - MUST BE LAST
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname,"../../frontend","dist","index.html"));
    })
} else {
    // In development, show a simple message at root
    app.get("/", (req,res) => {
        res.status(200).json({msg:"success at endpoint - development mode"});
    })
}

