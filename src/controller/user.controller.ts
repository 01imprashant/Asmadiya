import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../model/user.model";
import { uploadOnCloudinary }  from "../utils/cloudinary";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import 'dotenv/config';


// const generateAccessTokenAndRefreshToken =  async(userId:string) => {
//     try {
//         const user = await User.findById(userId);
//         const accessToken = user.generateAccessToken();
//         const refreshToken = user.generateRefreshToken();

//         user.refreshToken = refreshToken;
//         await user.save({ validateBeforeSave: false });
//         return { accessToken}
//     } catch (error) {
//         throw new ApiError(500, "Error while generating tokens")
//     }
// }


const registerUser = asyncHandler(async(req, res) => {
    // get user details from frontend
    const { firstName, lastName, email, password, phone, companyName } = req.body;
    
    // validation check - not empty
    if(!firstName || !lastName || !email || !password || !phone){
        throw new ApiError(400, "All fields are required");    
    }
    // check if user already exists - username or email
    const existedUser = await User.findOne({
        $or:[
            { email },
            { phone }
        ]
    })
    // if user already present
    if(existedUser){
        throw new ApiError(409, "User already Exists");
    }
    const files:any = req.files;
    // check for image, check for avatar
    const avatarLocalPath = files?.avatar?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Required");
    }
    // upload them to cloudinary, check avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // check if avatar successfully uploaded on cloudinary or not
    if(!avatar){
        throw new ApiError(400, "Error while uploading avatar");
    }
    // create user object - create entry in db
    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        avatar: avatar.url,
        companyName,
    })
    // remove password and refesh token field from response
    const createdUser = await User.findById(user._id).select("-password")
    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Error in Creating User")
    }
    // return response
    return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Register Successfully"))  
});


const logInUser = asyncHandler(async(req, res) => {
    // get user details from frontend
    const { email, password } = req.body;
    // validation check - not empty
    if(!email || !password ){
        throw new ApiError(400, "email and password is required");
    }
    // find user in db
    const user = await User.findOne({
        $or:[
            { email },
        ]
    })
    if(!user){
        throw new ApiError(401, "user not exist")
    }
    // check password
    // const isPasswordMatched = await user.comparePassword(password);
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    console.log("isPasswordMatched", isPasswordMatched);
    if(!isPasswordMatched){
        throw new ApiError(401, "Invalid Password")
    }
    // generate accesstoken and refreshtoken
    const accessToken = jwt.sign(
        { _id: user._id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any }
    )    

    // remove password and refresh Token field from response
    const loggedInUser = await User.findById(user._id).select("-password ");
    // send cookies
    const options ={
        httpOnly: true,
        secure: true,
    }
    // return response
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
        200,{ user: loggedInUser, accessToken },
        "User LoggedIn Successfully")
    )   
});

export {
    registerUser,
    logInUser,
}