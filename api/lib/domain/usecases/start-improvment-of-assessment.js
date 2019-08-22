const { AlreadySharedCampaignParticipationError } = require('../../domain/errors');
const _ = require('lodash');
const Assessment = require('../../domain/models/Assessment');

module.exports = async function startImprovmentOfAssessment({ assessmentId, assessmentRepository }) {
  const assessment = await assessmentRepository.get(assessmentId);
  if (_.get(assessment, 'campaignParticipation.isShared')) {
    throw new AlreadySharedCampaignParticipationError();
  }
  return assessmentRepository.updateStateById({ id: assessmentId, state: Assessment.states.IMPROVING });
};
