const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "skillsprout.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  instructor TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT NOT NULL,
  prerequisites TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(course_id, position)
);
CREATE TABLE IF NOT EXISTS enrollments (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, course_id)
);
CREATE TABLE IF NOT EXISTS module_completions (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, module_id)
);
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers TEXT NOT NULL,
  recommended_course_ids TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const seedCourses = [
  {id:"python",title:"Python Programming",category:"Programming",icon:"🐍",duration:"8 Weeks",level:"Beginner",instructor:"Priya Sharma",description:"Build a strong foundation in Python, problem solving and automation.",skills:["programming","python","logic"],prerequisites:[],modules:["Python setup and syntax","Variables, data types and operators","Conditions and loops","Functions and collections","Files, exceptions and modules","Build a Python mini project"]},
  {id:"javascript",title:"JavaScript Essentials",category:"Web Development",icon:"⚡",duration:"7 Weeks",level:"Beginner",instructor:"Rahul Verma",description:"Learn modern JavaScript and build interactive web experiences.",skills:["programming","javascript","web"],prerequisites:[],modules:["JavaScript and browser basics","Variables, types and operators","Conditions, loops and functions","Arrays and objects","DOM, events and validation","Fetch API mini project"]},
  {id:"htmlcss",title:"HTML & CSS Foundations",category:"Web Development",icon:"🌐",duration:"5 Weeks",level:"Beginner",instructor:"Rahul Verma",description:"Create accessible, responsive web pages using HTML and CSS.",skills:["web","html","css","design"],prerequisites:[],modules:["Semantic HTML","Forms, links and media","CSS selectors and box model","Flexbox, Grid and responsive design","Build a responsive portfolio"]},
  {id:"frontend",title:"Frontend Development",category:"Web Development",icon:"🧩",duration:"9 Weeks",level:"Intermediate",instructor:"Rahul Verma",description:"Combine HTML, CSS and JavaScript to create polished web applications.",skills:["web","javascript","frontend"],prerequisites:["htmlcss","javascript"],modules:["Frontend architecture","Advanced DOM patterns","Async JavaScript and Fetch","Accessible UI components","Client-side state and routing","Build a complete frontend app"]},
  {id:"sql",title:"SQL & Database Basics",category:"Data Science",icon:"🗄️",duration:"4 Weeks",level:"Beginner",instructor:"Ananya Reddy",description:"Understand relational databases, SQL queries and data modelling.",skills:["database","sql","data"],prerequisites:[],modules:["Relational database concepts","SELECT, WHERE and ORDER BY","JOINs and aggregate functions","Keys, constraints and schema design"]},
  {id:"datascience",title:"Data Science with Python",category:"Data Science",icon:"📊",duration:"9 Weeks",level:"Intermediate",instructor:"Ananya Reddy",description:"Explore data cleaning, analysis and visualisation using Python.",skills:["data","python","statistics"],prerequisites:["python"],modules:["Data science workflow","NumPy fundamentals","Pandas data cleaning","Exploratory data analysis","Visualisation and storytelling","Final data project"]},
  {id:"ai",title:"Artificial Intelligence Foundations",category:"Data Science",icon:"🤖",duration:"10 Weeks",level:"Intermediate",instructor:"Ananya Reddy",description:"Understand AI, machine learning workflows and responsible AI.",skills:["ai","data","python","machine-learning"],prerequisites:["python","datascience"],modules:["AI and machine learning overview","Preparing datasets","Supervised learning","Unsupervised learning","Model evaluation and responsible AI","AI mini project"]},
  {id:"uiux",title:"UI/UX Design",category:"Design",icon:"🎨",duration:"6 Weeks",level:"Beginner",instructor:"Arjun Kumar",description:"Design useful digital experiences through research, wireframes and prototypes.",skills:["design","ui","ux"],prerequisites:[],modules:["Human-centred design","User research and personas","Information architecture","Wireframing","Prototyping and usability testing","Portfolio case study"]},
  {id:"java",title:"Java Programming",category:"Programming",icon:"☕",duration:"8 Weeks",level:"Beginner",instructor:"Priya Sharma",description:"Learn object-oriented programming and core Java concepts.",skills:["programming","java","logic"],prerequisites:[],modules:["Java setup and syntax","Variables and operators","Conditions and loops","Methods and arrays","Object-oriented programming","Java mini project"]},
  {id:"backend",title:"Backend Development with Node.js",category:"Web Development",icon:"🛠️",duration:"8 Weeks",level:"Intermediate",instructor:"Rahul Verma",description:"Create REST APIs, validate requests and connect applications to databases.",skills:["backend","node","api","database"],prerequisites:["javascript","sql"],modules:["Node.js runtime and npm","Express routing and middleware","REST API design","SQLite integration","Authentication and security","Deploy a backend API"]}
];

const insertCourse = db.prepare(`INSERT OR IGNORE INTO courses
(id,title,category,icon,duration,level,instructor,description,skills,prerequisites)
VALUES (@id,@title,@category,@icon,@duration,@level,@instructor,@description,@skills,@prerequisites)`);
const insertModule = db.prepare(`INSERT OR IGNORE INTO modules (id,course_id,title,description,position) VALUES (?,?,?,?,?)`);
const seed = db.transaction(() => {
  for (const c of seedCourses) {
    insertCourse.run({...c, skills:JSON.stringify(c.skills), prerequisites:JSON.stringify(c.prerequisites)});
    c.modules.forEach((title, i) => insertModule.run(`${c.id}-m${i+1}`, c.id, title, `Complete the learning activity: ${title}.`, i+1));
  }
});
seed();

module.exports = db;
