import dotenv from "dotenv";

dotenv.config({quiet:true}); 

export const ENV = {
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL:process.env.CLIENT_URL,
    INNJEST_EVENT_KEY:process.env.INNJEST_EVENT_KEY,
    INNJEST_SIGNING_KEY:process.env.INNJEST_SIGNING_KEY,
    STREAM_API_KEY:process.env.STREAM_API_KEY,
    STREAM_SECRET_KEY:process.env.STREAM_SECRET_KEY
};