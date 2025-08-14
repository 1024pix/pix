import * as injectedCampaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedCampaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { AssessmentEndedError } from '../../../shared/domain/errors.js';
import * as injectedAnswerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';
import * as injectedChallengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as injectedAlgorithmDataFetcherService from '../services/algorithm-methods/data-fetcher.js';
import * as injectedSmartRandomService from '../services/algorithm-methods/smart-random.js';
import * as injectedImprovementService from '../services/improvement-service.js';
import { pickChallengeService as injectedPickChallengeService } from '../services/pick-challenge-service.js';

const getNextChallengeForCampaignAssessment = async function ({
  assessment,
  locale,
  challengeRepository = injectedChallengeRepository,
  answerRepository = injectedAnswerRepository,
  pickChallengeService = injectedPickChallengeService,
  algorithmDataFetcherService = injectedAlgorithmDataFetcherService,
  smartRandomService = injectedSmartRandomService,
  campaignRepository = injectedCampaignRepository,
  knowledgeElementRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  improvementService = injectedImprovementService,
} = {}) {
  const { allAnswers, lastAnswer, targetSkills, challenges, knowledgeElements } =
    await algorithmDataFetcherService.fetchForCampaigns({
      assessment,
      locale,
      answerRepository,
      campaignRepository,
      challengeRepository,
      knowledgeElementRepository,
      campaignParticipationRepository,
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
  });
};

export { getNextChallengeForCampaignAssessment };
