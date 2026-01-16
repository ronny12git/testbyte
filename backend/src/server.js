import express from "express";
import {ENV} from "./libs/env.js";
import path from "path";
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(ENV.PORT)
console.log(ENV.DB_URL)
const app = express();

// API routes - these must come BEFORE the static files
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
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname,"../../frontend/dist")));

    // Use middleware for catch-all instead of app.get("*")
    // This works with Express v5
    app.use((req, res) => {
        res.sendFile(path.join(__dirname,"../../frontend","dist","index.html"));
    })
} else {
    // In development, show a simple message at root
    app.get("/", (req,res) => {
        res.status(200).json({msg:"success at endpoint - development mode"});
    })
}

app.listen(ENV.PORT,() =>{
    console.log("server is running on port " + ENV.PORT);
})