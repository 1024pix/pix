const { AssessmentEndedError } = require('../errors');
const SmartRandom = require('../strategies/SmartRandom');
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

module.exports = function getNextChallengeForSmartPlacement({
  assessment,
  answerRepository,
  challengeRepository,
  smartPlacementKnowledgeElementRepository,
  targetProfileRepository
} = {}) {

  let answers, challenges, targetProfile, knowledgeElements;
  const targetProfileId = assessment.campaignParticipation.getTargetProfileId();
  return answerRepository.findByAssessment(assessment.id)
    .then((fetchedAnswers) => (answers = fetchedAnswers))
    .then(() => targetProfileRepository.get(targetProfileId))
    .then((fetchedTargetProfile) => (targetProfile = fetchedTargetProfile))
    .then(() => challengeRepository.findBySkills(targetProfile.skills))
    .then((fetchedChallenges) => (challenges = fetchedChallenges))
    .then(() => smartPlacementKnowledgeElementRepository.findByAssessmentId(assessment.id))
    .then((knowledgeElementsForAssessment) => (knowledgeElements = knowledgeElementsForAssessment))
    .then(() => getNextChallengeInSmartRandom(
      answers,
      challenges,
      targetProfile,
      knowledgeElements
    ))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);
};
