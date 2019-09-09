const constants = require('../constants');
const _ = require('lodash');
const moment = require('moment');

function _keepKnowledgeElementsRecentOrValidated({ currentUserKnowledgeElements, assessment }) {
  const startedDateOfAssessment = assessment.createdAt;

  const retriableKnowledgeElements = _.filter(currentUserKnowledgeElements, (knowledgeElement) => {
    const isOldEnoughToBeImproved = moment(startedDateOfAssessment).diff(knowledgeElement.createdAt, 'days', true) >= parseInt(constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING);
    return knowledgeElement.isInvalidated && isOldEnoughToBeImproved;
  });
  const knowledgeElementsRecentAndValidated = _.difference(currentUserKnowledgeElements, retriableKnowledgeElements);
  return knowledgeElementsRecentAndValidated;
}

function filterKnowledgeElementsIfImproving({ knowledgeElements, assessment }) {
  if (assessment.isImproving) {
    return _keepKnowledgeElementsRecentOrValidated({ currentUserKnowledgeElements: knowledgeElements, assessment });
  }
  return knowledgeElements;
}

module.exports = {
  filterKnowledgeElementsIfImproving,
};
