const { AssessmentEndedError } = require('../errors');
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

module.exports = function getNextChallengeForSmartPlacement({
  assessment,
  answerRepository,
  challengeRepository,
  targetProfileRepository
} = {}) {

  let answers, challenges, targetProfile;
  let targetProfileId = null;
  if(assessment.campaignParticipation) {
    targetProfileId = assessment.campaignParticipation.getTargetProfileId();
  }
  return answerRepository.findByAssessment(assessment.id)
    .then((fetchedAnswers) => (answers = fetchedAnswers))
    .then(() => targetProfileRepository.get(targetProfileId))
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
