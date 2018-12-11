const { AssessmentEndedError } = require('../errors');
const SmartRandom = require('../strategies/SmartRandom');
const _ = require('lodash');

module.exports = getNextChallengeForSmartPlacement;

function getNextChallengeInSmartRandom(answersPix, challengesPix, targetProfile, knowledgeElements) {
  const smartRandom = new SmartRandom({
    answers: answersPix,
    challenges: challengesPix,
    targetProfile,
    knowledgeElements
  });
  const nextChallenge = smartRandom.getNextChallenge();
  return _.get(nextChallenge, 'id', null);
}

module.exports = function getNextChallengeForSmartPlacement(
  {
    assessment,
    answerRepository,
    challengeRepository,
    smartPlacementKnowledgeElementRepository,
    targetProfileRepository
  } = {}) {

function getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, assessmentsRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository } = {}) {
  let answers, targetProfile, knowledgeElements;
  const targetProfileId = assessment.campaignParticipation.getTargetProfileId();
  const userId = assessment.userId;

  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(targetProfileId),
    getSmartPlacementKnowledgeElements({ userId, assessmentsRepository, smartPlacementKnowledgeElementRepository })]

  ).then(([answersOfAssessments, targetProfileFound, knowledgeElementsOfAssessments]) => {
    answers = answersOfAssessments;
    targetProfile = targetProfileFound;
    knowledgeElements = knowledgeElementsOfAssessments;

    return challengeRepository.findBySkills(targetProfile.skills);
  })
    .then((challenges) => getNextChallengeInSmartRandom(answers, challenges, targetProfile, knowledgeElements))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);
};
