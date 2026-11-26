const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { topologicalSort, getUnlockStatus, recommendLearningPath } = require("../algorithms/dag");
const router = express.Router();

function parseList(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getCourses() {
  const rows = db.prepare("SELECT * FROM courses ORDER BY title").all();
  const modulesQuery = db.prepare(
    "SELECT id,title,description,position FROM modules WHERE course_id=? ORDER BY position"
  );
  return rows.map(course => ({
    ...course,
    skills: parseList(course.skills),
    prerequisites: parseList(course.prerequisites),
    modules: modulesQuery.all(course.id)
  }));
}
function getCompletedCourseIds(userId) {
  return db.prepare(`
    SELECT e.course_id FROM enrollments e
    JOIN modules m ON m.course_id=e.course_id
    JOIN module_completions mc ON mc.module_id=m.id AND mc.user_id=e.user_id
    WHERE e.user_id=?
    GROUP BY e.course_id
    HAVING COUNT(DISTINCT mc.module_id)=COUNT(DISTINCT m.id)
  `).all(userId).map(row=>row.course_id);
}
router.get("/",(req,res)=>res.json({courses:getCourses()}));
router.get("/learning-order",(req,res)=> {
  const courses=getCourses();
  try { res.json({order:topologicalSort(courses), explanation:"Kahn's algorithm processes courses with zero unmet prerequisites first."}); }
  catch { res.status(500).json({error:"Course prerequisite graph contains a cycle."}); }
});
router.get("/path/:courseId",requireAuth,(req,res)=>{
  const courses=getCourses();
  if (!courses.some(c=>c.id===req.params.courseId)) return res.status(404).json({error:"Course not found."});
  const completed=getCompletedCourseIds(req.user.id);
  const ids=recommendLearningPath(req.params.courseId,courses,completed);
  res.json({path:ids.map(id=>courses.find(c=>c.id===id)),completedCourseIds:completed});
});
router.get("/dashboard",requireAuth,(req,res)=>{
  const courses=getCourses();
  const enrollments=db.prepare("SELECT course_id,enrolled_at FROM enrollments WHERE user_id=?").all(req.user.id);
  const data=enrollments.map(e=>{
    const course=courses.find(c=>c.id===e.course_id);
    const done=db.prepare(`SELECT module_id FROM module_completions WHERE user_id=? AND module_id IN (SELECT id FROM modules WHERE course_id=?)`).all(req.user.id,e.course_id).map(x=>x.module_id);
    const total=course.modules.length, progress=total?Math.round(done.length/total*100):0;
    const status=getUnlockStatus(course,courses,getCompletedCourseIds(req.user.id));
    return {course,progress,completedModules:done,totalModules:total,unlocked:status.unlocked,missingPrerequisites:status.missingPrerequisites,enrolledAt:e.enrolled_at};
  });
  const average=data.length?Math.round(data.reduce((s,x)=>s+x.progress,0)/data.length):0;
  res.json({enrollments:data,summary:{enrolled:data.length,completed:data.filter(x=>x.progress===100).length,averageProgress:average}});
});
router.post("/:id/enroll",requireAuth,(req,res)=>{
  const courses=getCourses(), course=courses.find(c=>c.id===req.params.id);
  if(!course) return res.status(404).json({error:"Course not found."});
  const status=getUnlockStatus(course,courses,getCompletedCourseIds(req.user.id));
  if(!status.unlocked) return res.status(403).json({error:"Complete prerequisite courses first.",missingPrerequisites:status.missingPrerequisites});
  db.prepare("INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)").run(req.user.id,course.id);
  res.status(201).json({message:"Enrollment saved.",courseId:course.id});
});
router.post("/:courseId/modules/:moduleId/complete",requireAuth,(req,res)=>{
  const course=coursesSafe().find(c=>c.id===req.params.courseId);
  if(!course) return res.status(404).json({error:"Course not found."});
  const enrolled=db.prepare("SELECT 1 FROM enrollments WHERE user_id=? AND course_id=?").get(req.user.id,course.id);
  if(!enrolled) return res.status(403).json({error:"Enroll in this course before completing modules."});
  const module=db.prepare("SELECT id FROM modules WHERE id=? AND course_id=?").get(req.params.moduleId,course.id);
  if(!module) return res.status(404).json({error:"Module not found."});
  db.prepare("INSERT OR IGNORE INTO module_completions(user_id,module_id) VALUES(?,?)").run(req.user.id,module.id);
  const total=db.prepare("SELECT COUNT(*) AS n FROM modules WHERE course_id=?").get(course.id).n;
  const done=db.prepare("SELECT COUNT(*) AS n FROM module_completions mc JOIN modules m ON m.id=mc.module_id WHERE mc.user_id=? AND m.course_id=?").get(req.user.id,course.id).n;
  res.json({message:"Module completion recorded.",progress:Math.round(done/total*100),completedModules:done,totalModules:total});
});
function coursesSafe(){return getCourses();}
module.exports=router;
