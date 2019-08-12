const Assessment = require('../models/Assessment');

module.exports = async function startImprovmentOfAssessment({ assessmentId, assessmentRepository }) {
  const assessmentUpdated = await assessmentRepository.updateStateById({ id: assessmentId, state: Assessment.states.IMPROVING });
  return assessmentUpdated;
};
