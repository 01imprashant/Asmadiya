import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary=async function(localFilePath:string) {
    try {
        if(!localFilePath){
            // console.log("File path is required");
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
            }
        )
        // console.log("File is uploaded on cloudinary", response);
        // file has been uploaded on cloudinary successfully
        // console.log("File is uploaded on cloudinary",response.url);
        // fs.unlinkSync(localFilePath);// delete the file from local storage
        if(fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;
    } catch (error) {
        // delete the file from local storage
        fs.unlinkSync(localFilePath);
        console.log("Error while uploading file on Cloudinary", error);
        throw new Error("Error while uploading file on Cloudinary");
    }  
}

export {
    uploadOnCloudinary
}