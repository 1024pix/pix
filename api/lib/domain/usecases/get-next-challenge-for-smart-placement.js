const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../strategies/smartRandom');
const _ = require('lodash');

module.exports = getNextChallengeForSmartPlacement;

function getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, assessmentRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository } = {}) {
  let answers, targetProfile, knowledgeElements;
  const targetProfileId = assessment.campaignParticipation.getTargetProfileId();
  const userId = assessment.userId;

  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(targetProfileId),
    getSmartPlacementKnowledgeElements({ userId, assessmentRepository, smartPlacementKnowledgeElementRepository })]

  ).then(([answersOfAssessments, targetProfileFound, knowledgeElementsOfAssessments]) => {
    answers = answersOfAssessments;
    targetProfile = targetProfileFound;
    knowledgeElements = knowledgeElementsOfAssessments;

    return challengeRepository.findBySkills(targetProfile.skills);
  })
    .then((challenges) => getNextChallengeInSmartRandom({ answers, challenges, targetProfile, knowledgeElements }))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);
}

function getNextChallengeInSmartRandom({ answers, challenges, targetProfile, knowledgeElements }) {
  const nextChallenge = smartRandom.getNextChallenge({ answers, challenges, targetProfile, knowledgeElements });
  return _.get(nextChallenge, 'id', null);
}

function getSmartPlacementKnowledgeElements({ userId, assessmentRepository, smartPlacementKnowledgeElementRepository }) {
  return assessmentRepository.findSmartPlacementAssessmentsByUserId(userId)
    .then((assessments) => _.map(assessments, 'id'))
    .then((assessmentIds) => smartPlacementKnowledgeElementRepository.findByAssessmentIds(assessmentIds))
    .then((knowledgeElementsLists) => _.flatten(knowledgeElementsLists))
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
