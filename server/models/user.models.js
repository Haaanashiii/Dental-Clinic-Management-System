const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose'); 

const userSchema = new mongoose.Schema({
    userId: { type: String, default: uuidv4, unique: true }, // auto-generates
    username: { type: String, required: true, unique: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] 
    },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['patient', 'dentist', 'staff'],
        required: true 
    }
});

module.exports = mongoose.model('User', userSchema);