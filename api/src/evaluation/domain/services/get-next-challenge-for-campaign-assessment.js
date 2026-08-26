import Debug from 'debug';

import { AssessmentEndedError } from '../../../shared/domain/errors.js';

const debugChallengeLocales = Debug('pix:challenge:locales');

export async function getNextChallengeForCampaignAssessment({
  assessment,
  locale,
  smartRandomChallengeRepository,
  answerRepository,
  pickChallengeService,
  algorithmDataFetcherService,
  smartRandomService,
  campaignRepository,
  knowledgeStateRepository,
  knowledgeStateForParticipationService,
  campaignParticipationRepository,
  improvementService,
}) {
  const { allAnswers, lastAnswer, targetSkills, challenges, knowledgeState } =
    await algorithmDataFetcherService.fetchForCampaigns({
      assessment,
      locale,
      answerRepository,
      campaignRepository,
      smartRandomChallengeRepository,
      knowledgeStateRepository,
      campaignParticipationRepository,
      knowledgeStateForParticipationService,
      improvementService,
    });

  debugChallengeLocales(
    'wanted locale "%s", proposed challenges with locales: %O',
    locale,
    (challenges || []).map((challenge) => {
      return {
        challengeId: challenge.id,
        challengeLocales: challenge.locales,
      };
    }),
  );

  const algoResult = smartRandomService.getPossibleSkillsForNextChallenge({
    knowledgeState,
    challenges,
    targetSkills,
    lastAnswer,
    allAnswers,
    locale,
  });

  if (algoResult.hasAssessmentEnded) {
    throw new AssessmentEndedError();
  }

  const smartRandomChallenge = pickChallengeService.pickChallenge({
    skills: algoResult.possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale,
  });
  return smartRandomChallenge.id;
}
