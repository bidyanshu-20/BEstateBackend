import UserModel from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
// ✅ Sign Up
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "User already exists"));
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};

// ✅ Sign In
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validUser = await UserModel.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not Found!"));
    }

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "Wrong Credentials"));
    }
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/", // <--- IMPORTANT ON VERCEL
      })
      .status(200)
      .json(rest);
    // res.cookie('access_token',token,{httpOnly:true}).status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
        })
        .status(200)
        .json(rest);
    } else {
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
      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true, // 🔥 CHANGED
          sameSite: "none",
          path: "/", // <--- IMPORTANT ON VERCEL
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      secure: true, // 🔥 CHANGED
      sameSite: "none", // 🔥 CHANGED
      path: "/", // <--- IMPORTANT ON VERCEL
    });
    res.status(200).json("User has been Logged Out!");
  } catch (error) {
    next(error);
  }
};
