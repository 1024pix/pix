const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../strategies/smart-random');
const _ = require('lodash');

function getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository }) {
  return getSmartRandomInputValues({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository })
    .then(([answers, [targetProfile, challenges], knowledgeElements]) => smartRandom.getNextChallenge({ answers, challenges, targetProfile, knowledgeElements }))
    .then((nextChallenge) => nextChallenge || Promise.reject(AssessmentEndedError));
}

function getSmartRandomInputValues({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository }) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(assessment.campaignParticipation.getTargetProfileId())
      .then((targetProfile) => Promise.all([targetProfile, challengeRepository.findBySkills(targetProfile.skills)])),
    keepOnlyMostRecentKnowledgeElements({ userId: assessment.userId, smartPlacementKnowledgeElementRepository })]
  );
}

// Two knowledge elements can match the same skill id
function keepOnlyMostRecentKnowledgeElements(knowledgeElements) {
  return _(knowledgeElements)
    .orderBy('createdAt')
    .sortedUniqBy('skillId')
    .value();
}

module.exports = getNextChallengeForSmartPlacement;
