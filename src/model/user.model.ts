import mongoose from "mongoose";
import bcrypt from "bcrypt";


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


export const User = mongoose.model("User", userSchema)