const constants = require('../constants');
const _ = require('lodash');
const moment = require('moment');
const catAlgorithm = require('../services/smart-random/cat-algorithm');

function _removeOldAndInvalidatedKnowledgeElements({ knowledgeElements, assessment }) {
  const startedDateOfAssessment = assessment.createdAt;
  knowledgeElements = _.filter(knowledgeElements, (knowledgeElement) => {
    const isNotOldEnoughToBeRetry = moment(startedDateOfAssessment).diff(knowledgeElement.createdAt, 'days') < parseInt(constants.DAYS_BEFORE_IMPROVING);
    const isFromThisAssessment = knowledgeElement.assessmentId === assessment.id;
    return knowledgeElement.isValidated || isNotOldEnoughToBeRetry || isFromThisAssessment;
  });
  return knowledgeElements;
}

function _removeUntargetedKnowledgeElements(knowledgeElements, listOfSkillsTested) {
  return _.filter(knowledgeElements, (ke) => listOfSkillsTested.some((skill) => skill.id === ke.skillId));
}

function filterKnowledgeElementsToRemoveThoseWhichCanBeImproved({ knowledgeElements, assessment }) {
  if (assessment.isImproving()) {
    return _removeOldAndInvalidatedKnowledgeElements({ knowledgeElements, assessment });
  }
  return knowledgeElements;
}

function verifyIfAssessmentCouldBeImproved({ assessment, knowledgeElements, listOfSkillsTested }) {
  const assessmentCanBeImproved = assessment.isCompleted() || assessment.isImproving();

  if (!assessmentCanBeImproved) {
    return false;
  }

  knowledgeElements = _removeUntargetedKnowledgeElements(knowledgeElements, listOfSkillsTested);
  const listKnowledgeElementsAfterImprovingFilter = _removeOldAndInvalidatedKnowledgeElements({ assessment, knowledgeElements });
  const skillsNotTested = _.differenceWith(listOfSkillsTested, listKnowledgeElementsAfterImprovingFilter, (skill, ke) => ke.skillId === skill.id);

  if (skillsNotTested.length === 0) {
    return false;
  }
  return _userCanHaveQuestion({ knowledgeElements: listKnowledgeElementsAfterImprovingFilter, targetSkills: listOfSkillsTested });
}

module.exports = {
  filterKnowledgeElementsToRemoveThoseWhichCanBeImproved,
  verifyIfAssessmentCouldBeImproved,
};

