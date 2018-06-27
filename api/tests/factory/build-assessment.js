const Assessment = require('../../lib/domain/models/Assessment');

const buildAnswer = require('./build-answer');
const buildCourse = require('./build-course');
const buildAssessmentResult = require('./build-assessment-result');

module.exports = function({
  id = 1,
  courseId = 'courseId',
  createdAt = new Date('1992-06-12'),
  userId = 1,
  state = Assessment.states.COMPLETED,
  type = 'CERTIFICATION',
  course = buildCourse(),
  answers = [buildAnswer()],
  assessmentResults = [buildAssessmentResult()],
} = {}) {

  return new Assessment({
    // attributes
    id,
    courseId,
    createdAt,
    userId,
    type,
    state,

    // relationships
    answers,
    assessmentResults,
    course,
  });
};
