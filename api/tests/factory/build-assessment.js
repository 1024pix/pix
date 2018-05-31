const Assessment = require('../../lib/domain/models/Assessment');
const buildAssessementResult = require('./build-assessment-result');

module.exports = function({
  id = 1,
  assessmentResults = [buildAssessementResult()],
  courseId = 'courseId',
  createdAt = new Date('1992-06-12'),
  userId = 1,
  type = 'CERTIFICATION',
  state = 'completed',
} = {}) {

  const assessment = new Assessment({
    id,
    assessmentResults,
    courseId,
    createdAt,
    userId,
    type,
    state,
  });

  return assessment;
};

