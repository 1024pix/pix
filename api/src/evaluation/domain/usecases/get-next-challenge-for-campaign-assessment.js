import { AssessmentEndedError } from '../../../shared/domain/errors.js';

const getNextChallengeForCampaignAssessment = async function ({
  assessment,
  locale,
  answerRepository,
  pickChallengeService,
  algorithmDataFetcherService,
  smartRandomService,
  campaignRepository,
  knowledgeElementRepository,
  campaignParticipationRepository,
  challengesAPI,
  improvementService,
}) {
  const { allAnswers, lastAnswer, targetSkills, challenges, knowledgeElements } =
    await algorithmDataFetcherService.fetchForCampaigns({
      assessment,
      locale,
      answerRepository,
      campaignRepository,
      knowledgeElementRepository,
      campaignParticipationRepository,
      challengesAPI,
      improvementService,
    });
  const algoResult = smartRandomService.getPossibleSkillsForNextChallenge({
    knowledgeElements,
    challenges,
    targetSkills,
    lastAnswer,
    allAnswers,
    locale,
  });

  if (algoResult.hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  return pickChallengeService.pickChallenge({
    skills: algoResult.possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale,
  }).id;
};

export { getNextChallengeForCampaignAssessment };
