import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/User.model.js";
import { deleteStreamUser, upsertStreaUser } from "./stream.js";

// Initialize Inngest client
export const inngest = new Inngest({ 
  id: "testbyte",
  signingKey: process.env.INNGEST_SIGNING_KEY 
});

// Sync user when created in Clerk
const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0].email_address,
      firstName: first_name,
      lastName: last_name,
      profileImage: image_url
    };

    await User.create(newUser);
    console.log("User synced:", id);

    await upsertStreamUser({
        id: newUser.clerkId.toString(),
        name: newUser.name,
        image: newUser.profileImage
    });
  }
);

// Delete user from DB when deleted in Clerk
const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;

    await User.deleteOne({ clerkId: id });
    console.log("User deleted:", id);

    await deleteStreamUser(id.toString());

    
  }
);

// Export all functions
export const functions = [syncUser, deleteUserFromDB];