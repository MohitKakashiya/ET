import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_key"; // Replace with your own secret key
const JWT_EXPIRES = "24h"; // Token expiration time

const createToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

//REgister a user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email",
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    if (await userModel.findOne({ email })) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//login as user

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = createToken(user._id);
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//current user profile

export const getCurrentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("name email");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//update user profile

export const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    if(!name || !email || !validator.isEmail(email)){ 
      return res.status(400).json({
        success: false,
        message: "Valid name and email are required",
      });
    }
  try{
     const exists = await userModel.findOne({ email, _id: { $ne: req.user.id } });
     if(exists){
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
     }
     const user = await userModel.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("name email");
    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//to change user password

export const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if(!currentPassword || !newPassword || newPassword.length < 8){
      return res.status(400).json({
        success: false,
        message: "Current and new password (min 8 chars) are required",
      });
    }
    try{
        const user = await userModel.findById(req.user.id).select("password");
        if(!user){
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if(!match){
          return res.status(401).json({
            success: false,
            message: "Current password is incorrect",
          });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({
          success: true,
          message: "Password updated successfully",
        });

    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Server Error",
          });
    }
}
