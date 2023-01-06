'use strict';
require('dotenv').config();
const hashInt = require('hash-int');
const fs = require('fs');
const { find, isEmpty } = require('lodash');
const smartRandom = require('../../api/lib/domain/services/algorithm-methods/smart-random');
const dataFetcher = require('../../api/lib/domain/services/algorithm-methods/data-fetcher');
const challengeRepository = require('../../api/lib/infrastructure/repositories/challenge-repository');
const skillRepository = require('../../api/lib/infrastructure/repositories/skill-repository');
const campaignRepository = require('../../api/lib/infrastructure/repositories/campaign-repository');
const improvementService = require('../../api/lib/domain/services/improvement-service');
const pickChallengeService = require('../../api/lib/domain/services/pick-challenge-service');
const Answer = require('../../api/lib/domain/models/Answer');
const AnswerStatus = require('../../api/lib/domain/models/AnswerStatus');
const KnowledgeElement = require('../../api/lib/domain/models/KnowledgeElement');
const AlgoResult = require('./AlgoResult');

const POSSIBLE_ANSWER_STATUSES = [AnswerStatus.OK, AnswerStatus.KO];

function _readUsersKEFile(path) {
  if (path) {
    const file = fs.readFileSync(path, 'utf-8');
    if (file) {
      return JSON.parse(file);
    }
  }
  return [[]];
}

function answerTheChallenge({ challenge, allAnswers, allKnowledgeElements, targetSkills, userId, userResult, userKE }) {
  let result;
  const isFirstAnswer = !allAnswers.length;
  switch (userResult) {
    case 'ok':
      result = AnswerStatus.OK;
      break;
    case 'ko':
      result = AnswerStatus.KO;
      break;
    case 'random':
      result = POSSIBLE_ANSWER_STATUSES[Math.round(Math.random())];
      break;
    case 'firstOKthenKO':
      isFirstAnswer ? (result = AnswerStatus.OK) : (result = AnswerStatus.KO);
      break;
    case 'firstKOthenOK':
      isFirstAnswer ? (result = AnswerStatus.KO) : (result = AnswerStatus.OK);
      break;
    case 'KE': {
      const ke = find(userKE, (ke) => challenge.skill.id === ke.skillId);
      const status = ke ? ke.status : KnowledgeElement.StatusType.INVALIDATED;
      result = status === KnowledgeElement.StatusType.VALIDATED ? AnswerStatus.OK : AnswerStatus.KO;
      break;
    }
    default:
      result = AnswerStatus.OK;
  }
  const newAnswer = new Answer({ challengeId: challenge.id, result });

  const _getSkillsFilteredByStatus = (knowledgeElements, targetSkills, status) => {
    return knowledgeElements
      .filter((knowledgeElement) => knowledgeElement.status === status)
      .map((knowledgeElement) => knowledgeElement.skillId)
      .map((skillId) => targetSkills.find((skill) => skill.id === skillId));
  };

  const newKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
    answer: newAnswer,
    challenge,
    previouslyFailedSkills: _getSkillsFilteredByStatus(
      allKnowledgeElements,
      targetSkills,
      KnowledgeElement.StatusType.INVALIDATED,
    ),
    previouslyValidatedSkills: _getSkillsFilteredByStatus(
      allKnowledgeElements,
      targetSkills,
      KnowledgeElement.StatusType.VALIDATED,
    ),
    targetSkills,
    userId,
  });

  return {
    answerStatus: result,
    updatedAnswers: [...allAnswers, newAnswer],
    updatedKnowledgeElements: [...allKnowledgeElements, ...newKnowledgeElements],
  };
}

async function _getReferentiel({
  assessment,
  campaignId,
  answerRepository,
  challengeRepository,
  knowledgeElementRepository,
  skillRepository,
  improvementService,
  campaignRepository,
}) {
  if (campaignId) {
    const skills = await campaignRepository.findSkills({ campaignId });
    const campaignRepositoryStub = {
      findSkillsByCampaignParticipationId: () => {
        return skills;
      },
    };
    const campaignParticipationRepositoryStub = {
      isRetrying: () => {
        return false;
      },
    };

    const { targetSkills, challenges } = await dataFetcher.fetchForCampaigns({
      assessment,
      answerRepository,
      campaignRepository: campaignRepositoryStub,
      challengeRepository,
      knowledgeElementRepository,
      improvementService,

      campaignParticipationRepository: campaignParticipationRepositoryStub,
    });

    return { targetSkills, challenges };
  } else {
    const { targetSkills, challenges } = await dataFetcher.fetchForCompetenceEvaluations({
      assessment,
      answerRepository,
      challengeRepository,
      knowledgeElementRepository,
      skillRepository,
      improvementService,
    });
    return { targetSkills, challenges };
  }
}

async function _getChallenge({ challenges, targetSkills, assessment, locale, knowledgeElements, allAnswers }) {
  const result = smartRandom.getPossibleSkillsForNextChallenge({
    knowledgeElements,
    challenges,
    targetSkills,
    lastAnswer: allAnswers[allAnswers.length - 1],
    allAnswers,
    locale,
  });

  const challenge = pickChallengeService.pickChallenge({
    skills: result.possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale: locale,
  });

  const challengeLevel = _getChallengeLevel({ assessment, result });

  return {
    challenge,
    hasAssessmentEnded: result.hasAssessmentEnded,
    estimatedLevel: result.levelEstimated,
    challengeLevel,
  };
}

function _getChallengeLevel({ assessment, result }) {
  const randomSeed = assessment.id;
  const skills = result.possibleSkillsForNextChallenge;
  const keyForSkill = Math.abs(hashInt(randomSeed));
  const chosenSkill = skills[keyForSkill % skills.length];
  return chosenSkill ? chosenSkill.difficulty : null;
}

async function proceedAlgo(
  challenges,
  targetSkills,
  assessment,
  locale,
  knowledgeElements,
  allAnswers,
  userResult,
  userKE,
) {
  let isAssessmentOver = false;
  const algoResult = new AlgoResult();

  while (!isAssessmentOver) {
    const { challenge, hasAssessmentEnded, estimatedLevel, challengeLevel } = await _getChallenge({
      challenges,
      targetSkills,
      assessment,
      locale,
      knowledgeElements,
      allAnswers,
    });
    algoResult.addEstimatedLevels(estimatedLevel);
    if (challenge) {
      const { answerStatus, updatedAnswers, updatedKnowledgeElements } = answerTheChallenge({
        challenge,
        allAnswers,
        userId: assessment.userId,
        allKnowledgeElements: knowledgeElements,
        targetSkills,
        userResult: isEmpty(userKE) ? userResult : 'KE',
        userKE,
      });
      allAnswers = updatedAnswers;
      knowledgeElements = updatedKnowledgeElements;
      algoResult.addChallenge(challenge);
      algoResult.addChallengeLevel(challengeLevel);
      algoResult.addAnswerStatus(answerStatus);
    }

    isAssessmentOver = hasAssessmentEnded;
  }

  console.log(algoResult.log());
  return algoResult;
}

async function launchTest(argv) {
  const { competenceId, campaignId, locale, userResult, usersKEFile, enabledCsvOutput } = argv;

  const allAnswers = [];
  const knowledgeElements = [];

  const assessment = {
    id: null,
    competenceId,
    userId: 1,
  };

  const knowledgeElementRepository = {
    findUniqByUserId: () => [],
  };
  const answerRepository = {
    findByAssessment: () => [],
  };

  const usersKE = _readUsersKEFile(usersKEFile);

  const { challenges, targetSkills } = await _getReferentiel({
    assessment,
    campaignId,
    answerRepository,
    challengeRepository,
    knowledgeElementRepository,
    skillRepository,
    improvementService,
    campaignRepository,
  });

  const proceedUsers = usersKE.map((userKE) => {
    return proceedAlgo(challenges, targetSkills, assessment, locale, knowledgeElements, allAnswers, userResult, userKE);
  });

  const algoResults = await Promise.all(proceedUsers);

  if (enabledCsvOutput) {
    const writeResults = algoResults.map((algoResult) => {
      return algoResult.writeCsvFile(campaignId ?? competenceId);
    });
    await Promise.all(writeResults);
  }

  process.exit(0);
}

module.exports = {
  answerTheChallenge,
  launchTest,
  _getReferentiel,
};
