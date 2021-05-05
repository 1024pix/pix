'use strict';
require('dotenv').config();
const fs = require('fs');
const { find } = require('lodash');
const smartRandom = require('../../api/lib/domain/services/smart-random/smart-random');
const dataFetcher = require('../../api/lib/domain/services/smart-random/data-fetcher');
const challengeRepository = require('../../api/lib/infrastructure/repositories/challenge-repository');
const skillRepository = require('../../api/lib/infrastructure/repositories/skill-repository');
const targetProfileRepository = require('../../api/lib/infrastructure/repositories/target-profile-repository');
const improvementService = require('../../api/lib/domain/services/improvement-service');
const pickChallengeService = require('../../api/lib/domain/services/pick-challenge-service');
const Answer = require('../../api/lib/domain/models/Answer');
const AnswerStatus = require('../../api/lib/domain/models/AnswerStatus');
const KnowledgeElement = require('../../api/lib/domain/models/KnowledgeElement');

const POSSIBLE_ANSWER_STATUSES = [AnswerStatus.OK, AnswerStatus.KO];

function _read(path) {
  if (path) {
    const file = fs.readFileSync(path, 'utf-8');
    if (file) {
      return JSON.parse(file);
    }
  }
  return [];
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
      isFirstAnswer ? result = AnswerStatus.OK : result = AnswerStatus.KO;
      break;
    case 'firstKOthenOK':
      isFirstAnswer ? result = AnswerStatus.KO : result = AnswerStatus.OK;
      break;
    case 'KE': {
      const ke = find(userKE, (ke) => challenge.skills.includes(ke.skillId));
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
    previouslyFailedSkills: _getSkillsFilteredByStatus(allKnowledgeElements, targetSkills, KnowledgeElement.StatusType.INVALIDATED),
    previouslyValidatedSkills: _getSkillsFilteredByStatus(allKnowledgeElements, targetSkills, KnowledgeElement.StatusType.VALIDATED),
    targetSkills,
    userId,
  });

  return { updatedAnswers: [...allAnswers, newAnswer], updatedKnowledgeElements: [...allKnowledgeElements, ...newKnowledgeElements] };
}

async function _getReferentiel({
  assessment,
  targetProfileId,
  answerRepository,
  challengeRepository,
  knowledgeElementRepository,
  skillRepository,
  improvementService,
  targetProfileRepository,
}) {
  if (targetProfileId) {
    const targetProfile = await targetProfileRepository.get(targetProfileId);
    const targetProfileRepositoryStub = {
      getByCampaignParticipationId: () => {
        return targetProfile;
      },
    };

    const { targetSkills, challenges } = await dataFetcher.fetchForCampaigns({
      assessment,
      answerRepository,
      targetProfileRepository: targetProfileRepositoryStub,
      challengeRepository,
      knowledgeElementRepository,
      improvementService,
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

async function _getChallenge({
  challenges,
  targetSkills,
  assessment,
  locale,
  knowledgeElements,
  allAnswers,
}) {
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

  if (challenge) {
    console.log(challenge.id);
    console.log(challenge.skills[0].name);
  }

  return { challenge, hasAssessmentEnded: result.hasAssessmentEnded };
}

async function launchTest(argv) {

  const { competenceId, targetProfileId, locale, userResult, userKEFile } = argv;

  let allAnswers = [];
  let knowledgeElements = [];

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

  const userKE = _read(userKEFile);

  let isAssessmentOver = false;

  const { challenges, targetSkills } = await _getReferentiel({
    assessment,
    targetProfileId,
    answerRepository,
    challengeRepository,
    knowledgeElementRepository,
    skillRepository,
    improvementService,
    targetProfileRepository,
  });

  while (!isAssessmentOver) {

    const { challenge, hasAssessmentEnded } = await _getChallenge({
      challenges,
      targetSkills,
      assessment,
      locale,
      knowledgeElements,
      allAnswers,
    });

    if (challenge) {
      const { updatedAnswers, updatedKnowledgeElements } = answerTheChallenge({
        challenge,
        allAnswers,
        userId: assessment.userId,
        allKnowledgeElements: knowledgeElements,
        targetSkills,
        userResult,
        userKE,
      });
      allAnswers = updatedAnswers;
      knowledgeElements = updatedKnowledgeElements;
    }

    isAssessmentOver = hasAssessmentEnded;
  }

  process.exit(0);
}

module.exports = {
  answerTheChallenge,
  launchTest,
  _getReferentiel,
};
