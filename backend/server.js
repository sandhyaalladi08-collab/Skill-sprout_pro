require("dotenv").config();
const express=require("express");
const path=require("path");
const helmet=require("helmet");
const cookieParser=require("cookie-parser");
const rateLimit=require("express-rate-limit");
const authRoutes=require("./routes/auth");
const courseRoutes=require("./routes/courses");
const diagnosticRoutes=require("./routes/diagnostic");
const contactRoutes=require("./routes/contact");

// A development-only fallback keeps the project runnable immediately after extraction.
// Production deployments must always provide their own strong JWT_SECRET.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === "production") {
    console.error("Set JWT_SECRET in your production environment (at least 32 characters).");
    process.exit(1);
  }
  process.env.JWT_SECRET = "skillsprout-local-development-secret-change-before-deployment";
  console.warn("Using the local development JWT secret. Set JWT_SECRET in .env before deployment.");
}
const app=express();
app.disable("x-powered-by");
app.use(helmet({contentSecurityPolicy:{directives:{
  defaultSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],scriptSrc:["'self'"],
  imgSrc:["'self'","data:"],connectSrc:["'self'"],objectSrc:["'none'"],upgradeInsecureRequests:null
}}}));
app.use(express.json({limit:"20kb"}));
app.use(cookieParser());
app.use("/api/auth",rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:true,legacyHeaders:false}),authRoutes);
app.use("/api/courses",courseRoutes);
app.use("/api/diagnostic",diagnosticRoutes);
app.use("/api/contact",rateLimit({windowMs:15*60*1000,limit:8,standardHeaders:true,legacyHeaders:false}),contactRoutes);
app.use(express.static(path.join(__dirname,"../frontend")));
app.get("/api/health",(req,res)=>res.json({status:"ok",service:"SkillSprout API"}));
app.use((req,res)=>res.status(404).json({error:"Route not found."}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:"Unexpected server error."});});
const port=Number(process.env.PORT)||3000;
app.listen(port,()=>console.log(`SkillSprout running at http://localhost:${port}`));
