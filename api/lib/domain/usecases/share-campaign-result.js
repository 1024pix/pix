const { UserNotAuthorizedToAccessEntity, AssessmentNotCompletedError } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

module.exports = async function shareCampaignResult({
  userId,
  campaignParticipationId,
  assessmentRepository,
  answerRepository,
  campaignParticipationRepository,
  challengeRepository,
  smartPlacementAssessmentRepository,
  knowledgeElementRepository,
  targetProfileRepository,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  if (!(await smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(campaignParticipation.assessmentId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }

  const assessment = await assessmentRepository.get(campaignParticipation.assessmentId);

  const getNextChallengeData = await dataFetcher.fetchForCampaigns({
    assessment,
    answerRepository,
    targetProfileRepository,
    challengeRepository,
    knowledgeElementRepository,
  });

  const { assessmentEnded } = smartRandom.getNextChallenge(getNextChallengeData);

  if (!assessmentEnded) {
    throw new AssessmentNotCompletedError();
  }

  return campaignParticipationRepository.updateCampaignParticipation(campaignParticipation);
};
