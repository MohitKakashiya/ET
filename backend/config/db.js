import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect("mongodb+srv://mkmohit4433_db_user:Mohit0916@cluster0.q378c1n.mongodb.net/Expense")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB:", err);
    });
}

export default connectDB;