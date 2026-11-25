import Debug from 'debug';

import { FlashAssessmentAlgorithm } from '../../../certification/evaluation/domain/models/FlashAssessmentAlgorithm.js';
import { candidateCertificationReferential } from '../../../certification/evaluation/domain/usecases/get-next-challenge.js';
import { AssessmentEndedError } from '../../../shared/domain/errors.js';
import { Assessment } from '../../../shared/domain/models/Assessment.js';

const debugChallengeLocales = Debug('pix:challenge:locales');

export async function getNextChallengeForCampaignAssessment({
  assessment,
  locale,
  smartRandomChallengeRepository,
  answerRepository,
  pickChallengeService,
  certificationPickChallengeService,
  algorithmDataFetcherService,
  smartRandomService,
  campaignRepository,
  knowledgeElementRepository,
  knowledgeElementForParticipationService,
  campaignParticipationRepository,
  improvementService,
  versionRepository,
  calibratedChallengeRepository,
  flashAlgorithmService,
}) {
  const { allAnswers, lastAnswer, targetSkills, challenges, knowledgeElements } =
    await algorithmDataFetcherService.fetchForCampaigns({
      assessment,
      locale,
      answerRepository,
      campaignRepository,
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

  if (assessment.method === Assessment.methods.IRT) {
    const version = await versionRepository.getByCampaignId(assessment.campaign.id);

    const answeredChallengeIds = allAnswers.map(({ challengeId }) => challengeId);

    const currentCalibratedChallenges = await calibratedChallengeRepository.findActiveFlashCompatible({
      locale,
      version,
    });

    const answeredCalibratedChallenges = await calibratedChallengeRepository.getMany({
      ids: answeredChallengeIds,
      version,
    });

    const challenges = candidateCertificationReferential(answeredCalibratedChallenges, currentCalibratedChallenges);

    const assessmentAlgorithm = new FlashAssessmentAlgorithm({
      flashAlgorithmImplementation: flashAlgorithmService,
      configuration: version.challengesConfiguration,
    });

    const possibleChallenges = assessmentAlgorithm.getPossibleNextChallenges({
      assessmentAnswers: allAnswers,
      challenges,
      skills: targetSkills,
    });

    if (possibleChallenges.length === 0) {
      throw new AssessmentEndedError();
    }
    const challenge = certificationPickChallengeService.getChallengePicker(
      version.challengesConfiguration.defaultProbabilityToPickChallenge,
    )({ possibleChallenges });

    return challenge.id;
  }

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
  return smartRandomChallenge.id;
}
