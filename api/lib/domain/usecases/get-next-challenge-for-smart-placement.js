const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../strategies/smart-random');

function getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository }) {
  return getSmartRandomInputValues({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository })
    .then(([answers, [targetProfile, challenges], knowledgeElements]) => smartRandom.getNextChallenge({ answers, challenges, targetProfile, knowledgeElements }))
    .then((nextChallenge) => nextChallenge || Promise.reject(new AssessmentEndedError()));
}

function getSmartRandomInputValues({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository }) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(assessment.campaignParticipation.getTargetProfileId())
      .then((targetProfile) => Promise.all([targetProfile, challengeRepository.findBySkills(targetProfile.skills)])),
    smartPlacementKnowledgeElementRepository.findUniqByUserId(assessment.userId)]
  );
}

module.exports = getNextChallengeForSmartPlacement;
