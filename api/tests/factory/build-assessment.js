const Assessment = require('../../lib/domain/models/Assessment');

const buildAnswer = require('./build-answer');
const buildCourse = require('./build-course');
const buildAssessementResult = require('./build-assessment-result');

module.exports = function({
  id = 1,
  assessmentResults = [buildAssessementResult()],
  courseId = 'courseId',
  createdAt = new Date('1992-06-12'),
  userId = 1,
  type = 'CERTIFICATION',
  state = 'completed',
  course = buildCourse(),
  answers = [buildAnswer()],
} = {}) {

  return new Assessment({
    // attributes
    id,
    assessmentResults,
    courseId,
    createdAt,
    userId,
    type,
    state,

    // relationships
    course,
    answers
  });
};
