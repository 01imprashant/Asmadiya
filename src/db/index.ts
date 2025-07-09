import mongoose from "mongoose";
import { DB_NAME } from "../constant";

const connectDB = async () => {
    try {
       const conectionInstence=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log("DATABASE CONNECT SUCCESSFULLFY");
       // console.log("connectionInstence",conectionInstence);
    } catch (error) {
        console.log("DATABASE CONECTION ERROR",error);
        process.exit(1);   
    }
}


// const connectDb = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
//     } catch (error) {
//         console.log("MONGODB Error Connecting :" , error);
//         process.exit(1);
//     }
// }



export default connectDB;