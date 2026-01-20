import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/User.model.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

// Initialize Inngest client
export const inngest = new Inngest({ 
  id: "testbyte",
  signingKey: process.env.INNGEST_SIGNING_KEY 
});

// Sync user when created in Clerk
const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    // Step 1: Connect to DB
    await step.run("connect-db", async () => {
      await connectDB();
      console.log("Connected to MongoDB");
    });

    // Step 2: Create user in MongoDB
    const newUser = await step.run("create-user-in-db", async () => {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;

      const email = (email_addresses && Array.isArray(email_addresses) && email_addresses.length > 0 && email_addresses[0].email_address) ? email_addresses[0].email_address : '';

      if (!email) {
        console.warn("No email address found for user:", id);
      }

      const userData = {
        clerkId: id,
        email: email,
        firstName: first_name || "",
        lastName: last_name || "",
        profileImage: image_url || ""
      };

      const user = await User.create(userData);
      console.log("User created in MongoDB:", id, "with email:", email || "none");
      return user;
    });

    // Step 3: Sync user to Stream
    const streamResult = await step.run("sync-user-to-stream", async () => {
      try {
        const streamUserData = {
          id: newUser.clerkId.toString(),
          name: [newUser.firstName, newUser.lastName].filter(Boolean).join(" ") || "User",
          image: newUser.profileImage || ""
        };

        console.log("Syncing to Stream with data:", streamUserData);
        
        await upsertStreamUser(streamUserData);
        
        console.log("User synced to Stream successfully:", newUser.clerkId);
        return { success: true };
      } catch (error) {
        console.error("Failed to sync user to Stream:", error);
        console.error("Error message:", error.message);
        console.error("User data:", newUser);
        // Don't throw - allow the function to complete even if Stream fails
        return { error: error.message, userId: newUser.clerkId };
      }
    });

    if (streamResult && streamResult.error) {
      return { success: false, error: streamResult.error, userId: newUser.clerkId };
    } else {
      return { success: true, userId: newUser.clerkId };
    }
  }
);

// Delete user from DB when deleted in Clerk
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    // Step 1: Connect to DB
    await step.run("connect-db", async () => {
      await connectDB();
    });

    // Step 2: Delete from MongoDB
    await step.run("delete-from-mongodb", async () => {
      const { id } = event.data;
      await User.deleteOne({ clerkId: id });
      console.log("User deleted from MongoDB:", id);
    });

    // Step 3: Delete from Stream
    await step.run("delete-from-stream", async () => {
      try {
        const { id } = event.data;
        await deleteStreamUser(id.toString());
        console.log("User deleted from Stream:", id);
      } catch (error) {
        console.error("Failed to delete user from Stream:", error);
        // Don't throw - allow the function to complete
        return { error: error.message };
      }
    });

    return { success: true };
  }
);

// Export all functions
export const functions = [syncUser, deleteUserFromDB];