const KnowledgeElement = require('../models/KnowledgeElement');
const _ = require('lodash');

async function resetCompetenceEvaluation({
  userId,
  competenceId,
  knowledgeElementRepository,
}) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({
    userId, competenceId
  });

  const resetKnowledgeElementsPromises = _.map(knowledgeElements,
    (knowledgeElement) => _resetKnowledgeElement({ knowledgeElement, knowledgeElementRepository })
  );

  return Promise.all(resetKnowledgeElementsPromises);
}

function _resetKnowledgeElement({ knowledgeElement, knowledgeElementRepository }) {
  const newKnowledgeElement = {
    status: KnowledgeElement.StatusType.RESET,
    earnedPix: 0,
    ...knowledgeElement
  };
  return knowledgeElementRepository.save(newKnowledgeElement);
}

module.exports = {
  resetCompetenceEvaluation,
};
