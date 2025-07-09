import 'dotenv/config';
import app from './app';
import connectDB from '../src/db/index';

const port = process.env.PORT || 5000;

connectDB()
.then(() =>{
    app.on("error", (error) => {
        console.log("Error:", error);
        throw error;
    })
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
        
    })
})
.catch((error) =>{
    console.log("Database connection failed", error);
})