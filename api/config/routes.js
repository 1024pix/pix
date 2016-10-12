const server = require('../server');
const Greetings = require('../app/controllers/greetings');
const Assessments = require('../app/controllers/assessments');
const Users = require('../app/controllers/users');
const Answers = require('../app/controllers/answers');
const Courses = require('../app/controllers/courses');
const Challenges = require('../app/controllers/challenges');

module.exports = [

  { method: 'GET',  path: '/', config: Greetings.world },
  { method: 'GET',  path: '/{name}', config: Greetings.buddy },

  { method: 'GET',  path: '/api/users', config: Users.list },
  { method: 'GET',  path: '/api/users/{id}', config: Users.get },
  { method: 'POST', path: '/api/users', config: Users.save },

  { method: 'GET',  path: '/api/assessments', config: Assessments.list },

  { method: 'GET',  path: '/api/answers', config: Answers.list },
  { method: 'POST', path: '/api/answers', config: Answers.save },

  { method: 'GET',  path: '/api/courses', config: Courses.list },
  { method: 'GET',  path: '/api/courses/{id}', config: Courses.get },

  { method: 'GET',  path: '/api/challenges/{id}', config: Challenges.get }

].map((route) => {
  route.config.cors = { origin: ['*'] };
  return route;
});
