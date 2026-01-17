import express from "express";
import {ENV} from "./libs/env.js";
import path from "path";
import { fileURLToPath } from 'url';
import { connectDB } from "./libs/db.js";
import cors from "cors";
import {serve} from "inngest/express";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())
// credential request meaning that cookies are sent along with requests
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))
app.use("/api/inngest",serve({client:inngest,functions}))
console.log(ENV.PORT)
console.log(ENV.DB_URL)
const app = express();

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

const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT,() =>{
        console.log("server is running on port " + ENV.PORT);
    });
        
    } catch (error) {
        console.error("error starting the server",error);
    }
}

startServer();