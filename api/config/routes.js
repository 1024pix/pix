'use strict';

const server = require('../server');
const Assessments = require('../app/controllers/assessments');
const Answers = require('../app/controllers/answers');
const Users = require('../app/controllers/users');
const Courses = require('../app/controllers/courses');
const Challenges = require('../app/controllers/challenges');

module.exports = [

  { method: 'GET',  path: '/api/users',                               config: Users.list },
  { method: 'GET',  path: '/api/users/{id}',                          config: Users.get },
  { method: 'POST', path: '/api/users',                               config: Users.save },

  { method: 'POST', path: '/api/assessments',                         config: Assessments.save },
  { method: 'GET',  path: '/api/assessments/{id}/next',               config: Assessments.getNextChallenge },
  { method: 'GET',  path: '/api/assessments/{id}/next/{challengeId}', config: Assessments.getNextChallenge },
  { method: 'GET',  path: '/api/assessments/{id}',                    config: Assessments.get },

  { method: 'POST', path: '/api/answers',                             config: Answers.save },
  { method: 'GET',  path: '/api/answers/{id}',                        config: Answers.get },

  { method: 'GET',  path: '/api/courses',                             config: Courses.list },
  { method: 'GET',  path: '/api/courses/{id}',                        config: Courses.get },

  { method: 'GET',  path: '/api/challenges',                          config: Challenges.list },
  { method: 'GET',  path: '/api/challenges/{id}',                     config: Challenges.get }

].map((route) => {
  route.config.cors = { origin: ['*'] };
  return route;
});
