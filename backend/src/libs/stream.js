import {StreamChat} from 'stream-chat';
import {ENV}  from './libs/env.js';


const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

if(!apiKey || !apiSecret){
    console.error("Stream API key or secret not found");
}


export const chatClient = StreamChat.getInstance(apiKey,apiSecret);

export const upsertStreaUser =async (userData) =>{
    try{
        await chatClient.upsertUser(userData)
        console.log("stream user upserted succesfully",userData.id)
    }catch(error){
        console.error("error upserting the stream user:",error);
    }
}

export const deleteStreamUser =async (userId) =>{
    try{
        await chatClient.deleteUser(userId)
        console.log("stream user deleted succesfully",userId)
        return userId
    }catch(error){
        console.error("error deleting the stream user:",error);
    }
}


// todo add another method to generate token 