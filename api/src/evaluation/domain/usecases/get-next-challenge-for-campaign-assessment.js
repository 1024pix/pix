import Debug from 'debug';

import { AssessmentEndedError } from '../../../shared/domain/errors.js';

const debugChallengeLocales = Debug('pix:challenge:locales');

export async function getNextChallengeForCampaignAssessment({
  assessment,
  locale,
  smartRandomChallengeRepository,
  smartRandomSkillRepository,
  answerRepository,
  pickChallengeService,
  algorithmDataFetcherService,
  smartRandomService,
  knowledgeElementRepository,
  knowledgeElementForParticipationService,
  campaignParticipationRepository,
  improvementService,
  challengeRepository,
}) {
  const { allAnswers, lastAnswer, targetSkills, challenges, knowledgeElements } =
    await algorithmDataFetcherService.fetchForCampaigns({
      assessment,
      locale,
      answerRepository,
      smartRandomSkillRepository,
      smartRandomChallengeRepository,
      knowledgeElementRepository,
      campaignParticipationRepository,
      knowledgeElementForParticipationService,
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

  const smartRandomChallenge = pickChallengeService.pickChallenge({
    skills: algoResult.possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale,
  });
  return challengeRepository.get(smartRandomChallenge.id);
}
