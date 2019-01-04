const { AssessmentEndedError } = require('../errors');
const SmartRandom = require('../services/smart-random/SmartRandom');
const _ = require('lodash');

function getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository }) {
  return getSmartRandomInputValues({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository })
    .then(([answers, [targetProfile, challenges], knowledgeElements]) => SmartRandom.getNextChallenge({ answers, challenges, targetProfile, knowledgeElements }))
    .then((nextChallenge) => nextChallenge || Promise.reject(new AssessmentEndedError()));
}

function getSmartRandomInputValues({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository }) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(assessment.campaignParticipation.getTargetProfileId())
      .then((targetProfile) => Promise.all([targetProfile, challengeRepository.findBySkills(targetProfile.skills)])),
    findMostRecentKnowledgeElements({ userId: assessment.userId, smartPlacementKnowledgeElementRepository })]
  );
}

// Two knowledge elements can match the same skill id
function findMostRecentKnowledgeElements({ userId, smartPlacementKnowledgeElementRepository }) {
  return smartPlacementKnowledgeElementRepository.findByUserId(userId)
    .then(((knowledgeElements) => _(knowledgeElements).orderBy('createdAt', 'desc').uniqBy('skillId').value()));
}

module.exports = getNextChallengeForSmartPlacement;
