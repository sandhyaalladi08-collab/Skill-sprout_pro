// Directed Acyclic Graph utilities: edges point from prerequisite -> dependent course.
function buildGraph(courses) {
  const ids = new Set(courses.map(c => c.id));
  const adjacency = new Map(courses.map(c => [c.id, []]));
  const indegree = new Map(courses.map(c => [c.id, 0]));
  for (const course of courses) {
    for (const prerequisite of course.prerequisites || []) {
      if (!ids.has(prerequisite)) continue;
      adjacency.get(prerequisite).push(course.id);
      indegree.set(course.id, indegree.get(course.id) + 1);
    }
  }
  return { adjacency, indegree };
}

function topologicalSort(courses) {
  const { adjacency, indegree } = buildGraph(courses);
  const queue = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id);
  const order = [];
  while (queue.length) {
    const current = queue.shift();
    order.push(current);
    for (const next of adjacency.get(current)) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) queue.push(next);
    }
  }
  if (order.length !== courses.length) throw new Error("Prerequisite graph contains a cycle.");
  return order;
}

function getPrerequisiteChain(courseId, courses) {
  const byId = new Map(courses.map(c => [c.id, c]));
  const visited = new Set();
  const result = [];
  function visit(id) {
    const course = byId.get(id);
    if (!course) return;
    for (const prerequisite of course.prerequisites || []) {
      if (!visited.has(prerequisite)) {
        visited.add(prerequisite);
        visit(prerequisite);
        result.push(prerequisite);
      }
    }
  }
  visit(courseId);
  return [...new Set(result)];
}

function getUnlockStatus(course, courses, completedCourseIds) {
  const completed = new Set(completedCourseIds);
  const missing = (course.prerequisites || []).filter(id => !completed.has(id));
  return { unlocked: missing.length === 0, missingPrerequisites: missing };
}

function recommendLearningPath(targetCourseId, courses, completedCourseIds = []) {
  const chain = getPrerequisiteChain(targetCourseId, courses);
  const all = [...chain, targetCourseId];
  return all.filter(id => !completedCourseIds.includes(id));
}

module.exports = { buildGraph, topologicalSort, getPrerequisiteChain, getUnlockStatus, recommendLearningPath };
