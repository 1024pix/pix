'use strict';
require('dotenv').config();

const smartRandom = require('../../api/lib/domain/services/smart-random/smart-random');
const dataFetcher = require('../../api/lib/domain/services/smart-random/data-fetcher');
const challengeRepository = require('../../api/lib/infrastructure/repositories/challenge-repository');
const skillRepository = require('../../api/lib/infrastructure/repositories/skill-repository');
const improvementService = require('../../api/lib/domain/services/improvement-service');
const pickChallengeService = require('../../api/lib/domain/services/pick-challenge-service');
const Answer = require('../../api/lib/domain/models/Answer');
const AnswerStatus = require('../../api/lib/domain/models/AnswerStatus');
const KnowledgeElement = require('../../api/lib/domain/models/KnowledgeElement');

function answerTheChallenge({ challenge, allAnswers }) {
  /** Answer the challenge **/
  const newAnswer = new Answer({ challengeId: challenge.id, result: AnswerStatus.OK });

  return [...allAnswers, newAnswer];
}

async function _getChallenge({ answerRepository, knowledgeElementRepository, assessment, locale, knowledgeElements, lastAnswer, allAnswers }) {
  const { targetSkills, challenges } = await dataFetcher.fetchForCompetenceEvaluations({
    assessment,
    answerRepository,
    challengeRepository,
    knowledgeElementRepository,
    skillRepository,
    improvementService,
  });

  const result = smartRandom.getPossibleSkillsForNextChallenge({
    knowledgeElements,
    challenges,
    targetSkills,
    lastAnswer,
    allAnswers,
    locale,
  });

  const challenge = pickChallengeService.pickChallenge({
    skills: result.possibleSkillsForNextChallenge,
    randomSeed: assessment.id,
    locale: locale,
  });

  console.log(challenge.id);
  console.log(challenge.skills[0].name);

  return { challenge, hasAssessmentEnded: result.hasAssessmentEnded };
}

async function launch_test(argv) {

  const competenceId = argv.competenceId;
  const locale = argv.locale;
  const lastAnswer = null;
  let allAnswers = [];
  let knowledgeElements = [];
  const assessment = {
    id: null,
    competenceId,
  };

  const knowledgeElementRepository = {
    findUniqByUserId: () => [],
  };
  const answerRepository = {
    findByAssessment: () => [],
  };

  let isAssessmentOver = false;

  while(!isAssessmentOver) {
    let { challenge, hasAssessmentEnded } = await _getChallenge({ answerRepository, knowledgeElementRepository, assessment, locale, knowledgeElements, lastAnswer, allAnswers });
    isAssessmentOver = hasAssessmentEnded;
  }

  process.exit(0);
}

module.exports = {
  answerTheChallenge,
  launch_test
}
