const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cookieOptions = () => ({httpOnly:true,secure:process.env.COOKIE_SECURE === "true",sameSite:"strict",maxAge:7*24*60*60*1000,path:"/"});

router.post("/register", (req,res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (name.length < 2 || name.length > 60) return res.status(400).json({error:"Name must be 2–60 characters."});
  if (!emailPattern.test(email) || email.length > 120) return res.status(400).json({error:"Enter a valid email address."});
  if (password.length < 8 || password.length > 72) return res.status(400).json({error:"Password must be 8–72 characters."});
  try {
    const hash = bcrypt.hashSync(password, 12);
    const result = db.prepare("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)").run(name,email,hash);
    const token = jwt.sign({email}, process.env.JWT_SECRET, {subject:String(result.lastInsertRowid),expiresIn:"7d"});
    res.cookie("skillsprout_token", token, cookieOptions()).status(201).json({user:{id:result.lastInsertRowid,name,email}});
  } catch (error) {
    if (String(error.code).includes("SQLITE_CONSTRAINT")) return res.status(409).json({error:"An account with this email already exists."});
    res.status(500).json({error:"Could not create your account."});
  }
});

router.post("/login", (req,res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !bcrypt.compareSync(password,user.password_hash)) return res.status(401).json({error:"Email or password is incorrect."});
  const token = jwt.sign({email:user.email},process.env.JWT_SECRET,{subject:String(user.id),expiresIn:"7d"});
  res.cookie("skillsprout_token",token,cookieOptions()).json({user:{id:user.id,name:user.name,email:user.email}});
});

router.post("/logout",(req,res)=>{res.clearCookie("skillsprout_token",{httpOnly:true,secure:process.env.COOKIE_SECURE==="true",sameSite:"strict",path:"/"});res.json({message:"Logged out successfully."});});
router.get("/me",requireAuth,(req,res)=>{const user=db.prepare("SELECT id,name,email,created_at FROM users WHERE id=?").get(req.user.id);res.json({user});});
module.exports = router;
