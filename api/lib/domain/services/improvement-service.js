const constants = require('../constants');
const moment = require('moment');

function _keepKnowledgeElementsRecentOrValidated({ currentUserKnowledgeElements, assessment }) {
  const startedDateOfAssessment = assessment.createdAt;

  return currentUserKnowledgeElements.filter((knowledgeElement) => {
    const isNotOldEnoughToBeImproved = moment(startedDateOfAssessment)
      .diff(knowledgeElement.createdAt, 'days', true) < constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;
    return knowledgeElement.isValidated || isNotOldEnoughToBeImproved;
  });
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
