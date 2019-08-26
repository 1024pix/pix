const constants = require('../constants');
const _ = require('lodash');
const moment = require('moment');

function _removeOldAndInvalidatedKnowledgeElements({ knowledgeElements, assessment }) {
  const startedDateOfAssessment = assessment.createdAt;
  knowledgeElements = _.filter(knowledgeElements, (knowledgeElement) => {
    const isNotOldEnoughToBeImproved = moment(startedDateOfAssessment).diff(knowledgeElement.createdAt, 'days') < parseInt(constants.DAYS_BEFORE_IMPROVING);
    const isFromThisAssessment = knowledgeElement.assessmentId === assessment.id;
    return knowledgeElement.isValidated || isNotOldEnoughToBeImproved || isFromThisAssessment;
  });
  return knowledgeElements;
}

function filterKnowledgeElementsToRemoveThoseWhichCanBeImproved({ knowledgeElements, assessment }) {
  if (assessment.isImproving) {
    return _removeOldAndInvalidatedKnowledgeElements({ knowledgeElements, assessment });
  }
  return knowledgeElements;
}

module.exports = {
  filterKnowledgeElementsToRemoveThoseWhichCanBeImproved,
};
