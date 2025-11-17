import UserModel from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

// ===================== SIGN UP =====================
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ===================== SIGN IN =====================
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validUser = await UserModel.findOne({ email });
    if (!validUser) {
      return res.status(404).json({
        success: false,
        message: "User not Found!",
      });
    }

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Wrong Credentials",
      });
    }

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc;

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      })
      .status(200)
      .json({
        success: true,
        ...rest,
      });
  } catch (error) {
    next(error);
  }
};

// ===================== GOOGLE AUTH =====================
export const google = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;

      return res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
        })
        .status(200)
        .json({
          success: true,
          ...rest,
        });
    }

    // register a new google user
    const generatePassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    const hashedPassword = bcrypt.hashSync(generatePassword, 10);

    const newUser = new UserModel({
      username:
        req.body.name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-4),
      email: req.body.email,
      password: hashedPassword,
      avatar: req.body.photo,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = newUser._doc;

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      })
      .status(200)
      .json({
        success: true,
        ...rest,
      });

  } catch (error) {
    next(error);
  }
};

// ===================== SIGN OUT =====================
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "User has been Logged Out!",
    });

  } catch (error) {
    next(error);
  }
};
