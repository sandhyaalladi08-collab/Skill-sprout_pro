const express=require("express");
const db=require("../db");
const router=express.Router();
router.post("/",(req,res)=>{
  const name=String(req.body.name||"").trim(),email=String(req.body.email||"").trim().toLowerCase(),message=String(req.body.message||"").trim();
  if(name.length<2||name.length>80) return res.status(400).json({error:"Name must be 2–80 characters."});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>120) return res.status(400).json({error:"Enter a valid email address."});
  if(message.length<10||message.length>2000) return res.status(400).json({error:"Message must be 10–2000 characters."});
  db.prepare("INSERT INTO contact_messages(name,email,message) VALUES(?,?,?)").run(name,email,message);
  res.status(201).json({message:"Thank you. Your message has been received."});
});
module.exports=router;
