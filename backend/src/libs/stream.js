import { StreamChat } from 'stream-chat';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

console.log("Stream API Key exists:", !!apiKey);
console.log("Stream Secret exists:", !!apiSecret);

if (!apiKey || !apiSecret) {
  console.error("Missing Stream credentials!");
  console.error("STREAM_API_KEY:", apiKey ? "Set" : "Missing");
  console.error("STREAM_SECRET_KEY:", apiSecret ? "Set" : "Missing");
  throw new Error("Stream API key or secret not found");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    console.log("Attempting to upsert Stream user:", userData);
    
    const response = await chatClient.upsertUser(userData);
    
    console.log("Stream user upserted successfully:", userData.id);
    console.log("Stream response:", response);
    
    return response;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    console.error("Error details:", error.message);
    console.error("User data that failed:", userData);
    throw error;
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    console.log("Attempting to delete Stream user:", userId);
    
    await chatClient.deleteUser(userId, {
      mark_messages_deleted: true,
      hard_delete: false
    });
    
    console.log("Stream user deleted successfully:", userId);
    return userId;
  } catch (error) {
    console.error("Error deleting Stream user:", error);
    console.error("Error details:", error.message);
    console.error("User ID that failed:", userId);
    throw error;
  }
};

// Generate token for user authentication
export const generateStreamToken = (userId) => {
  try {
    const token = chatClient.createToken(userId);
    console.log("Stream token generated for user:", userId);
    return token;
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};