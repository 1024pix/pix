/* eslint-disable no-unused-vars */
const { AssessmentEndedError, UserNotAuthorizedToAccessEntity } = require('../errors');
const smartRandom = require('../services/smart-random/smart-random');
const dataFetcher = require('../services/smart-random/data-fetcher');

async function getNextChallengeForCompetenceEvaluation({
  knowledgeElementRepository,
  competenceEvaluationRepository,
  challengeRepository,
  answerRepository,
  skillRepository,
  assessment,
  userId,
}) {

  _checkIfAssessmentBelongsToUser(assessment, userId);

  const [
    answers,
    targetSkills,
    challenges,
    knowledgeElements
  ] = await dataFetcher.fetchForCompetenceEvaluations(...arguments);

  const {
    nextChallenge,
    assessmentEnded,

  } = smartRandom.getNextChallenge({
    answers,
    challenges,
    targetSkills,
    knowledgeElements
  });

  if (assessmentEnded) {
    throw new AssessmentEndedError();
  }
  return nextChallenge;
}

function _checkIfAssessmentBelongsToUser(assessment, userId) {
  if (assessment.userId != userId) {
    throw new UserNotAuthorizedToAccessEntity();
  }
}

module.exports = getNextChallengeForCompetenceEvaluation;
