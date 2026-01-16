import express from "express";
import {ENV} from "./libs/env.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.listen(ENV.PORT,() =>{
    console.log("server is running on port " + ENV.PORT);
})