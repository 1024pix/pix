const { AssessmentEndedError } = require('../errors');
const TargetProfile = require('../models/TargetProfile');
const SmartRandom = require('../strategies/SmartRandom');
const _ = require('lodash');

function getNextChallengeInSmartRandom(answersPix, challengesPix, targetProfile) {
  const smartRandom = new SmartRandom({
    answers: answersPix,
    challenges: challengesPix,
    targetProfile: targetProfile,
  });
  const nextChallenge = smartRandom.getNextChallenge();
  return _.get(nextChallenge, 'id', null);
}

module.exports = function({
  assessment,
  answerRepository,
  challengeRepository,
} = {}) {

  let answers, challenges;

  const targetProfile = TargetProfile.TEST_PROFIL;

  return answerRepository.findByAssessment(assessment.id)
    .then(fetchedAnswers => (answers = fetchedAnswers))
    .then(() => challengeRepository.findBySkills(targetProfile.skills))
    .then(fetchedChallenges => (challenges = fetchedChallenges))
    .then(() => getNextChallengeInSmartRandom(
      answers,
      challenges,
      targetProfile,
    ))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);

};
