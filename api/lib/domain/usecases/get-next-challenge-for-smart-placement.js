const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../strategies/smartRandom');
const _ = require('lodash');

module.exports = getNextChallengeForSmartPlacement;

function getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository } = {}) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(assessment.campaignParticipation.getTargetProfileId()),
    getSmartPlacementKnowledgeElements({ userId: assessment.userId, smartPlacementKnowledgeElementRepository })]

  ).then(([answers, targetProfile, knowledgeElements]) =>
    challengeRepository.findBySkills(targetProfile.skills)
      .then((challenges) => smartRandom.getNextChallenge({ answers, challenges, targetProfile, knowledgeElements }))
      .then((nextChallenge) => {
        if (nextChallenge) {
          return nextChallenge;
        }
        throw new AssessmentEndedError();
      })
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
