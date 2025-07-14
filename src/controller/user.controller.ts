import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import sendMail from "../utils/sendMail";
import { User } from "../model/user.model";
import { uploadOnCloudinary }  from "../utils/cloudinary";
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
        .json(new ApiError(400,"", false, null, "All fields are required"));   
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
        return res
        .status(409)
        .json(new ApiError(409, "", false, null, "User already Exists"));

    }
    // get user avatar from request
    const files:any = req.files;
    const avatarLocalPath = files?.avatar?.[0]?.path;
    // validation check - avatar is required
    if(!avatarLocalPath){
        // throw new ApiError(400, "Avatar Required");
        return res
        .status(400)
        .json(new ApiError(400, "", false, null, "Avatar Required"));
    }
    // upload them to cloudinary, check avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // check if avatar successfully uploaded on cloudinary or not
    if(!avatar){
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
        return res
        .status(400)
        .json(new ApiError(400, "", false, null, "email or phone and password is required"));
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
        return res
        .status(401)
        .json(new ApiError(401, "", false, null, "user not exist"));
    }
    // check password
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if(!isPasswordMatched){
        return res
        .status(401)
        .json(new ApiError(401, "", false, null, "Invalid Password"));
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
        new ApiResponse( 200, { firstName: user.firstName, token:accessToken }, "User LoggedIn Successfully")
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
        return res
        .status(404)
        .json(new ApiError(404, "", false, null, "User not found"));
    }
    // return response
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User Profile Fetched Successfully"));
});


const activeUsersByMonth = asyncHandler(async(req, res) => {
    // get year from request body
    const { year } = req.body;
    // Validate year (optional range logic)
    if (!year || typeof year !== "number" || year < 2021 || year > new Date().getFullYear()) {
        return res
        .status(400)
        .json(new ApiError(400, "Invalid year", false, null, "Year must be a valid number between 2021 and current year"));
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
    // Return the monthly counts
    return res
    .status(200)
    .json(new ApiResponse(200, monthlyCounts, "Active users per month from January to December"));
});


const companyProfit = asyncHandler(async(req, res) => {
    // Calculate company profit for the last 12 months
    let profit = [];
    for(let i=0; i<12; i++){
        profit.push(Math.floor(Math.random() * 100));
    }
    // Return the profit
    return res
    .status(200)    
    .json(new ApiResponse(200, profit, "Company profit fetched successfully"));
});


const totalUsers = asyncHandler(async(req, res) => {
    // Count total users in the database
    const dummyUsers = {
        2021: {
            india:[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200],
            usa:[150, 250, 350, 450, 550, 650, 750, 850, 950, 1050, 1150, 1250],
            france:[200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300]
        },
        2022: {
            india:[120, 220, 320, 420, 520, 620, 720, 820, 920, 1020, 1120, 1220],
            usa:[170, 270, 370, 470, 570, 670, 770, 870, 970, 1070, 1170, 1270],
            france:[220, 320, 420, 520, 620, 720, 820, 920, 1020, 1120, 1220, 1320]
        },
        2023: {
            india:[140, 240, 340, 440, 540, 640, 740, 840, 940, 1040, 1140, 1240],
            usa:[190, 290, 390, 490, 590, 690, 790, 890, 990, 1090, 1190, 1290],
            france:[240, 340, 440, 540, 640, 740, 840, 940, 1040, 1140, 1240, 1340]
        },
        2024: {
            india:[160, 260, 360, 460, 560, 660, 760, 860, 960, 1060, 1160, 1260],
            usa:[210, 310, 410, 510, 610, 710, 810, 910, 1010, 1110, 1210, 1310],
            france:[260, 360, 460, 560, 660, 760, 860, 960, 1060, 1160, 1260, 1360]
        },
        2025: {
            india:[180, 280, 380, 480, 580, 680, 780, 880, 980, 1080, 1180, 1280],
            usa:[230, 330, 430, 530, 630, 730, 830, 930, 1030, 1130, 1230, 1330],
            france:[280, 380, 480, 580, 680, 780, 880, 980, 1080, 1180, 1280, 1380]
        }
    };
    // Return the total users
    return res
    .status(200)
    .json(new ApiResponse(200, dummyUsers, "Total users fetched successfully"));
});


const totalSocialMediaUsers = asyncHandler(async(req, res) => {
    // calculate total social media users for the last 5 years
    // Dummy data for social media users
    const dummySocialMediaUsers = {
        2021: {
            "youtube": 1000,
            "facebook": 1500,
            "instagram": 800,
            "twitter": 600,
        },
        2022: {
            "youtube": 1200,
            "facebook": 1700,
            "instagram": 900,
            "twitter": 700,
        },
        2023: {
            "youtube": 1400,
            "facebook": 1900,
            "instagram": 1000,
            "twitter": 800,
        },
        2024: {
            "youtube": 1600,
            "facebook": 2100,
            "instagram": 1100,
            "twitter": 900,
        },
        2025: {
            "youtube": 1800,
            "facebook": 2300,
            "instagram": 1200,
            "twitter": 1000,
        }
    }
    // Return the social media users
    return res
    .status(200)
    .json(new ApiResponse(200, dummySocialMediaUsers, "Total social media users fetched successfully"));
});


const forgotPassword = asyncHandler(async(req, res) => {
    // Placeholder for forgot password logic
    const { email } = req.body;
    if(!email){
        return res
        .status(400)
        .json(new ApiError(400, "", false, null, "Email is required"));
    }
    // Logic to handle forgot password
    const user = await User.findOne({ email }); 
    // if user not found   
    if(!user){  
        return res
        .status(404)
        .json(new ApiError(404, "", false, null, "User not found"));
    }
    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`);
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await user.save(); 
    // Send OTP to user's email
    const subject = "Password Reset OTP";
    const Message = `Your OTP is ${otp}`;
    await sendMail(email, subject, Message);
    return res
    .status(200)
    .json(new ApiResponse(200, "", "OTP sent to user email successfully"));

});


const resetPassword = asyncHandler(async(req, res) => {
    // Placeholder for reset password logic
    const { otp, newPassword, confirmPassword } = req.body;
    if(!otp || !newPassword || !confirmPassword){
        return res
        .status(400)
        .json(new ApiError(400, "", false, null, "All fields are required"));
    }
    // Check if new password and confirm password match
    if(newPassword !== confirmPassword){
        return res
        .status(400)
        .json(new ApiError(400, "", false, null, "New password and confirm password must be same"));
    }
    // Find user by email and OTP
    const user = await User.findOne({ otp });

    if (!user || user.otp !== otp) {
        return res
        .status(400)
        .json(new ApiError(400, "", false, null, "Invalid OTP "));
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
        return res
        .status(400)
        .json(new ApiError(400, "", false, null, "OTP has expired"));
    }

    user.password = confirmPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    // Return success response
    return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successful"));

});

export {
    registerUser,
    logInUser,
    logOutUser,
    activeUsersByMonth,
    getUserProfile,
    companyProfit,
    totalUsers,
    totalSocialMediaUsers,
    forgotPassword,
    resetPassword
}