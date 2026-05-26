import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true, //for this particular field we are going to store the user id of the user who created the income record
  },
  type: {
    type: String,
    default: "income",
  },
});

const incomeModel = mongoose.model("income", incomeSchema);

export default incomeModel;
