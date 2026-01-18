import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    profileImage:{
        type:String,
        default:"",
    },
    clerkID:{
        type:String,
    }
    },
    {timestamps:true} // createdAt and updatedAt fields will be added automatically
)

const User = mongoose.model("User",userSchema);

export default User;