const faker = require('faker');
const Assessment = require('../../lib/domain/models/Assessment');

const buildAnswer = require('./build-answer');
const buildCourse = require('./build-course');
const buildAssessmentResult = require('./build-assessment-result');

module.exports = function({
  id = faker.random.number(),
  assessmentResults = [buildAssessementResult()],
  courseId = 'courseId',
  createdAt = new Date('1992-06-12'),
  userId = faker.random.number(),
  type = Assessment.types.CERTIFICATION,
  state = Assessment.states.COMPLETED,
  course = buildCourse({ id: 'courseId' }),
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
