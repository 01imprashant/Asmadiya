import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

const userSchema = new mongoose.Schema({
    firstName: {
        required: true,
        type: String,
        trim:true,
    },
    lastName: {
        required: true,
        type: String,
        trim:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength:8,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        maxlength:12
    },
    avatar: {
        type: String, //cloudinary
    },
    companyName: {
        type: String,
        default:""
    },
    refreshToken: { 
        type:String,
    }    
},{timestamps:true})


userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    else{
        return next();
    }
})

// userSchema.methods.comparePassword = async function(password:string){
//     return await bcrypt.compare(password, this.password);
// }

// userSchema.methods.generateAccessToken = function(): string {
//     return jwt.sign (
//         {
//             _id: this._id,
//             email: this.email,
//             firstName: this.firstName,
//             lastName: this.lastName,
//         },
//         process.env.ACCESS_TOKEN_SECRET as string,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
//         }
//     )
// }


// userSchema.methods.generateRefreshToken = function(): string {   
//     return jwt.sign (
//         {
//             _id: this._id,
//         },
//         process.env.REFRESH_TOKEN_SECRET as string,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
//         }
//     )
// }

export const User = mongoose.model("User", userSchema)