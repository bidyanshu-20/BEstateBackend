import express from 'express';
import { signup ,signin , google , signOut} from '../controllers/auth.controller.js';
const authrouter = express.Router();
authrouter.post("/signup",signup);
authrouter.post("/signin",signin);
authrouter.post("/google",google);
authrouter.get("/signout",signOut)
export default authrouter;