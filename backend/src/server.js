import express from "express";
import {ENV} from "./libs/env.js";

console.log(ENV.PORT)
console.log(ENV.DB_URL)
const app = express();

app.get("/", (req,res) => {
    res.status(200).json({msg:"success hahaha"});
})
app.listen(ENV.PORT,() =>{
    console.log("server is running on port " + ENV.PORT);
})