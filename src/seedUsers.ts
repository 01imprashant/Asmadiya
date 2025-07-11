// seedUsers.ts
import mongoose from "mongoose";
import { User } from "./model/user.model"; // adjust path as needed
import dotenv from "dotenv";

dotenv.config(); // loads environment variables

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    await User.deleteMany(); // optional: clears existing users

    const users = [
      {
        firstName: "Deepak",
        lastName: "Kumar Bansal",
        email: "deepakkumarbansal@gmail.com",
        password: "$2b$10$BetisFWKH8wm9omKPVD/8.ssYTzU0WD/13dCBbT4ATFU4Z6N.FGC6",
        phone: "1234567890",
        avatar: "http://res.cloudinary.com/prashant01youtube/image/upload/v1752046741/example.jpg",
        companyName: "",
        createdAt: new Date("2024-07-09T07:39:02.392Z"),
        updatedAt: new Date("2024-07-09T07:39:02.392Z"),
      },
      {
        firstName: "Aman",
        lastName: "Verma",
        email: "aman.verma@example.com",
        password: "$2b$10$BetisFWKH8wm9omKPVD/8.ssYTzU0WD/13dCBbT4ATFU4Z6N.FGC6",
        phone: "2345678901",
        avatar: "http://res.cloudinary.com/prashant01youtube/image/upload/v1752046741/example2.jpg",
        companyName: "TechSoft",
        createdAt: new Date("2024-06-05T10:20:30.000Z"),
        updatedAt: new Date("2024-06-05T10:20:30.000Z"),
      },
      {
        firstName: "Neha",
        lastName: "Sharma",
        email: "neha.sharma@example.com",
        password: "$2b$10$BetisFWKH8wm9omKPVD/8.ssYTzU0WD/13dCBbT4ATFU4Z6N.FGC6",
        phone: "3456789012",
        avatar: "http://res.cloudinary.com/prashant01youtube/image/upload/v1752046741/example3.jpg",
        companyName: "DevCorp",
        createdAt: new Date("2024-03-15T14:30:45.000Z"),
        updatedAt: new Date("2024-03-15T14:30:45.000Z"),
      },
    ];

    await User.insertMany(users);
    console.log("✅ Dummy users seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
