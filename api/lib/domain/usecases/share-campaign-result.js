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
  const assessment = await assessmentRepository.getByCampaignParticipationId(campaignParticipationId);

  if (!(await smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser(assessment.id, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not have an access to this campaign participation');
  }

  const getNextChallengeData = await dataFetcher.fetchForCampaigns({
    assessment,
    answerRepository,
    targetProfileRepository,
    challengeRepository,
    knowledgeElementRepository,
  });

  const { hasAssessmentEnded } = smartRandom.getNextChallenge(getNextChallengeData);

  if (!hasAssessmentEnded) {
    throw new AssessmentNotCompletedError();
  }

  return campaignParticipationRepository.share(assessment.campaignParticipation);
};
