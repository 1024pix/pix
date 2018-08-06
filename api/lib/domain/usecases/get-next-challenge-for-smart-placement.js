const { AssessmentEndedError } = require('../errors');
const SmartRandom = require('../strategies/SmartRandom');
const _ = require('lodash');

const PICInitialDiagnosticTargetProfileId = 1; /// XXX For now it is the only used target profile

function getNextChallengeInSmartRandom(answersPix, challengesPix, targetProfile) {
  const smartRandom = new SmartRandom({
    answers: answersPix,
    challenges: challengesPix,
    targetProfile: targetProfile,
  });
  const nextChallenge = smartRandom.getNextChallenge();
  return _.get(nextChallenge, 'id', null);
}

module.exports = function getNextChallengeForSmartPlacement({
  assessment,
  answerRepository,
  challengeRepository,
  targetProfileRepository
} = {}) {

  let answers, challenges, targetProfile;

  return answerRepository.findByAssessment(assessment.id)
    .then((fetchedAnswers) => (answers = fetchedAnswers))
    .then(() => targetProfileRepository.get(PICInitialDiagnosticTargetProfileId))
    .then((fetchedTargetProfile) => (targetProfile = fetchedTargetProfile))
    .then(() => challengeRepository.findBySkills(targetProfile.skills))
    .then((fetchedChallenges) => (challenges = fetchedChallenges))
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
