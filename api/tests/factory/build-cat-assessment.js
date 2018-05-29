const buildCatAnswer = require('./build-cat-answer');
const buildCatCourse = require('./build-cat-course');
const CatAssessment = require('../../lib/cat/assessment');

module.exports = function buildCatAssessment({
  course = buildCatCourse(),
  answers = [buildCatAnswer()],
} = {}) {
  return new CatAssessment(course, answers);
};
