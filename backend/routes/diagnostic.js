const express=require("express");
const db=require("../db");
const {requireAuth}=require("../middleware/auth");
const {topologicalSort}=require("../algorithms/dag");
const router=express.Router();
const allowedSkills=["programming","python","javascript","web","html","css","frontend","backend","node","api","database","sql","data","statistics","ai","machine-learning","design","ui","ux","logic"];

router.post("/",requireAuth,(req,res)=>{
  const answers=req.body.answers;
  if(!answers || typeof answers!=="object" || Array.isArray(answers)) return res.status(400).json({error:"Submit your diagnostic answers."});
  const interests=Array.isArray(answers.interests)?answers.interests.filter(x=>allowedSkills.includes(x)):[];
  const experience=["beginner","some","confident"].includes(answers.experience)?answers.experience:"beginner";
  const goal=["web","data","ai","design","software","backend"].includes(answers.goal)?answers.goal:"software";
  const courses=db.prepare("SELECT * FROM courses").all().map(c=>({...c,skills:JSON.parse(c.skills),prerequisites:JSON.parse(c.prerequisites)}));
  const score=(course)=>{
    let value=course.skills.reduce((n,skill)=>n+(interests.includes(skill)?3:0),0);
    const goalMap={web:["web","frontend","javascript"],data:["data","statistics","python"],ai:["ai","machine-learning","data"],design:["design","ui","ux"],software:["programming","logic","python","java"],backend:["backend","node","api","database"]};
    value+=(goalMap[goal]||[]).reduce((n,s)=>n+(course.skills.includes(s)?4:0),0);
    if(experience==="beginner" && course.level==="Beginner") value+=2;
    if(experience==="confident" && course.level==="Intermediate") value+=1;
    return value;
  };
  const ranked=courses.map(c=>({id:c.id,score:score(c)})).sort((a,b)=>b.score-a.score);
  const learningOrder=topologicalSort(courses);
  const ordered=learningOrder.map(id=>ranked.find(x=>x.id===id)).filter(Boolean).sort((a,b)=>b.score-a.score);
  const recommendations=ordered.slice(0,4).map(x=>({course:courses.find(c=>c.id===x.id),matchScore:x.score}));
  db.prepare("INSERT INTO diagnostic_results(user_id,answers,recommended_course_ids) VALUES(?,?,?)").run(req.user.id,JSON.stringify({interests,experience,goal}),JSON.stringify(recommendations.map(x=>x.course.id)));
  res.json({recommendations,reason:"Recommendations are ranked from your selected interests, experience level and career goal. Prerequisite order is checked using the course DAG."});
});
module.exports=router;
