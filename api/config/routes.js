const server = require('../server');
const Greetings = require('../app/controllers/greetings');
const Users = require('../app/controllers/users');
const Courses = require('../app/controllers/courses');
const Challenges = require('../app/controllers/challenges');

module.exports = [

  { method: 'GET', path: '/', config: Greetings.world },
  { method: 'GET', path: '/{name}', config: Greetings.buddy },

  { method: 'GET', path: '/api/users', config: Users.list },
  { method: 'GET', path: '/api/users/{id}', config: Users.get },

  { method: 'GET', path: '/api/courses', config: Courses.list },
  { method: 'GET', path: '/api/courses/{id}', config: Courses.get },

  { method: 'GET', path: '/api/challenges', config: Challenges.list },
  { method: 'GET', path: '/api/challenges/{id}', config: Challenges.get }

];
