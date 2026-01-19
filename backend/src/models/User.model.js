import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined values
    },
    imageUrl: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'interviewer'],
        default: 'user'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

export const User = mongoose.model('User', userSchema);