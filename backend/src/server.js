import express from "express";
import {ENV} from "./libs/env.js";
import path from "path";
import { fileURLToPath } from 'url';
import { handleClerkWebhook } from "./controllers/clerkWebhook.controller.js";
import { connectDB } from "./libs/db-connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(ENV.PORT)
console.log(ENV.DB_URL)

// Connect to MongoDB
connectDB();

const app = express();

// Clerk webhook needs raw body
app.post("/api/webhooks/clerk", express.raw({ type: 'application/json' }), handleClerkWebhook);

// Regular JSON parsing for other routes
app.use(express.json());

// API routes
app.get("/health", (req,res) => {
    res.status(200).json({msg:"success at health endpoint"});
})
app.get("/books", (req,res) => {
    res.status(200).json({msg:"success at books endpoint"});
})
app.get("/store", (req,res) => {
    res.status(200).json({msg:"success at store endpoint"});
})

if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../../frontend/dist")));

    app.use((req, res) => {
        res.sendFile(path.join(__dirname,"../../frontend","dist","index.html"));
    })
} else {
    app.get("/", (req,res) => {
        res.status(200).json({msg:"success at endpoint - development mode"});
    })
}

const PORT = ENV.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
