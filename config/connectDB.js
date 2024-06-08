import mongoose from "mongoose";

const connectDB = async (DB_URL) => {
    try {
        const DB_OPTION = { 
            dbName : "authentication"
        }
        await mongoose.connect(DB_URL,DB_OPTION);
    } catch (error) {
        console.log(error);
    }
}

export default connectDB