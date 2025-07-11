import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../model/user.model";
import { uploadOnCloudinary }  from "../utils/cloudinary";
import { verifyJWT } from "../middleware/auth.middleware";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import 'dotenv/config';


const registerUser = asyncHandler(async(req, res) => {
    // get user details from frontend
    const { firstName, lastName, email, password, phone, companyName } = req.body;
    
    // validation check - not empty
    if(!firstName || !lastName || !email || !password || !phone){
        return res
        .status(400)
        .json(new ApiError(400," ", false, null, "All fields are required"));   
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
        // throw new ApiError(409, "User already Exists");
        return res
        .status(409)
        .json(new ApiError(409, "", false, null, "User already Exists"));

    }
    const files:any = req.files;
    // check for image, check for avatar
    const avatarLocalPath = files?.avatar?.[0]?.path;

    if(!avatarLocalPath){
        // throw new ApiError(400, "Avatar Required");
        return res
        .status(400)
        .json(new ApiError(400, " ", false, null, "Avatar Required"));
    }
    // upload them to cloudinary, check avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // check if avatar successfully uploaded on cloudinary or not
    if(!avatar){
        // throw new ApiError(400, "Error while uploading avatar");
        return res
        .status(400)
        .json(new ApiError(400, "", false, null, "Error while uploading avatar"));
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
        // throw new ApiError(500, "Error in Creating User");
        return res
        .status(500)
        .json(new ApiError(500, "", false, null, "Error in Creating User"));
    }
    // return response
    return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Register Successfully"))  
});


const logInUser = asyncHandler(async(req, res) => {
    // get user details from frontend
    const { emailOrPhone, password } = req.body;
    // validation check - not empty
    if( !emailOrPhone || !password ){
        // throw new ApiError(400, "email or phone and password is required");
        return res
        .status(400)
        .json(new ApiError(400, " ", false, null, "email or phone and password is required"));
    }
    // find user in db
    const user = await User.findOne({
        $or:[
            { email: emailOrPhone },
            { phone: emailOrPhone },
        ]
    });
    // if user not found
    if(!user){
        // throw new ApiError(401, "user not exist")
        return res
        .status(401)
        .json(new ApiError(401, " ", false, null, "user not exist"));
    }
    // check password
    // const isPasswordMatched = await user.comparePassword(password);
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if(!isPasswordMatched){
        // throw new ApiError(401, "Invalid Password")
        return res
        .status(401)
        .json(new ApiError(401, " ", false, null, "Invalid Password"));
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
    console.log(accessToken, user)
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
        200,{ user: loggedInUser, token:accessToken },
        "User LoggedIn Successfully")
    )   
});

const logOutUser = asyncHandler(async(req, res) => {
    // clear cookies
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .cookie("accessToken", "", { ...options, expires: new Date(0) })
    .json(new ApiResponse(200, null, "User LoggedOut Successfully"))
});


const getUserProfile = asyncHandler(async(req, res) => {
    // get user id from request
    const userId = (req as any).user._id;
    // find user in db
    const user = await User.findById(userId).select("-password");
    // if user not found
    if(!user){
        // throw new ApiError(404, "User not found");
        return res
        .status(404)
        .json(new ApiError(404, " ", false, null, "User not found"));
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User Profile Fetched Successfully"));
});


const activeUsersByMonth = asyncHandler(async(req, res) => {
    const { year } = req.body;

    // Validate year (optional range logic)
    if (!year || typeof year !== "number" || year < 2020 || year > new Date().getFullYear()) {
        return res
        .status(400)
        .json(new ApiError(400, "Invalid year", false, null, "Year must be a valid number between 2020 and current year."));
    }

    // Count total users to check if DB is empty
    const totalUsers = await User.countDocuments();
    if (totalUsers === 0) {
        return res
        .status(200)
        .json(new ApiResponse(200, Array(12).fill(0), "No users found in database"));
    }

    // Aggregate users created in the given year, grouped by month
    const usersByMonth = await User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`)
                }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]);

    // Fill the monthlyCounts array (index 0 = Jan, 11 = Dec)
    const monthlyCounts = Array(12).fill(0);
    usersByMonth.forEach(item => {
        monthlyCounts[item._id - 1] = item.count;
    });

    return res
    .status(200)
    .json(new ApiResponse(200, monthlyCounts, "Active users per month from January to December"));
});



export {
    registerUser,
    logInUser,
    logOutUser,
    activeUsersByMonth,
    getUserProfile
}