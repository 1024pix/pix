const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../strategies/smartRandom');
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
    getSmartPlacementKnowledgeElements({ userId: assessment.userId, smartPlacementKnowledgeElementRepository })]
  );
}

function getSmartPlacementKnowledgeElements({ userId, smartPlacementKnowledgeElementRepository }) {
  return smartPlacementKnowledgeElementRepository.findByUserId(userId)
    .then((knowledgeElements) => removeEquivalentKnowledgeElements(knowledgeElements));
}

// Two knowledge elements are equivalent if they correspond to the same skill
// We must only keep the most recent.
function removeEquivalentKnowledgeElements(knowledgeElements) {
  return _.reduce(knowledgeElements, (uniqueKnowledgeElements, currentKnowledgeElement) => {
    
    return thereExistsAMoreRecentEquivalentKnowledgeElement(uniqueKnowledgeElements, currentKnowledgeElement) 
      ? replaceKnowledgeElement(uniqueKnowledgeElements, currentKnowledgeElement)
      : uniqueKnowledgeElements.concat(currentKnowledgeElement);
  }, []);
}

function thereExistsAMoreRecentEquivalentKnowledgeElement(knowledgeElements, currentKnowledgeElement) {
  return _.find(knowledgeElements, (duplicatedKnowledgeElement) => {
    const isEquivalent = duplicatedKnowledgeElement.skillId === currentKnowledgeElement.skillId;
    const isMoreRecent = duplicatedKnowledgeElement.createdAt > currentKnowledgeElement.createdAt;

    return isEquivalent && isMoreRecent;
  });
}

function replaceKnowledgeElement(uniqueKnowledgeElements, currentKnowledgeElement) {
  return _.differenceBy(uniqueKnowledgeElements, [currentKnowledgeElement], 'skillId').concat(currentKnowledgeElement);
}

module.exports = getNextChallengeForSmartPlacement;
