const buildCatAnswer = require('./build-cat-answer');
const buildCatCourse = require('./build-cat-course');
const CatAssessment = require('../../lib/cat/assessment');
const faker = require('faker');

module.exports = function buildCatAssessment({
  course = buildCatCourse(),
  answers = [buildCatAnswer()],
  assessmentId = faker.random.uuid(),
} = {}) {
  return new CatAssessment(course, answers, assessmentId);
};
