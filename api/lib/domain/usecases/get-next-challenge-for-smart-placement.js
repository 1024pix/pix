const { AssessmentEndedError } = require('../errors');
const SmartRandom = require('../services/smart-random/SmartRandom');
const _ = require('lodash');

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

  let answers, targetProfile, knowledgeElements;
  const targetProfileId = assessment.campaignParticipation.getTargetProfileId();
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(targetProfileId),
    smartPlacementKnowledgeElementRepository.findByAssessmentId(assessment.id)]
  ).then(([answersOfAssessments, targetProfileFound, knowledgeElementsOfAssessment]) => {
    answers = answersOfAssessments;
    targetProfile = targetProfileFound;
    knowledgeElements = knowledgeElementsOfAssessment;
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
