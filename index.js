import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from './routes/user.routes.js'
import authrouter from "./routes/auth.routes.js";
import listingRouter from "./routes/listing.route.js"
dotenv.config(); 

// console.log("-----------------");


// console.log("Loaded MONGO_URL:", process.env.MONGO_URL);
mongoose
  .connect(process.env.MONGO_URI, {
    
  })
  .then(() =>  console.log("MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));
  
const app = express();

// console.log("✅ Loaded JWT_SECRET:", process.env.JWT_SECRET);


app.use(express.json());

app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use("/api/auth",authrouter);
app.use("/api/user",userRouter);
app.use("/api/listing",listingRouter)
// middleware for handling error
app.use((err,req,resp,next)=>{
  const statusCode = err.statusCode|| 500;
  const message = err.message || 'Internal server Issue..';
  return resp.status(statusCode).json({
    success:false,
    statusCode,
    message,
  })
})
app.listen(3000);
