const CompetenceEvaluation = require('../models/CompetenceEvaluation');
const KnowledgeElement = require('../models/KnowledgeElement');
const _ = require('lodash');

async function resetCompetenceEvaluation({
  userId,
  competenceId,
  knowledgeElementRepository,
  competenceEvaluationRepository,
}) {

  return Promise.all([
    _resetCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }),
    _resetKnowledgeElements({ userId, competenceId, knowledgeElementRepository }),
  ]);
}

async function _resetKnowledgeElements({ userId, competenceId, knowledgeElementRepository }) {
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

function _resetCompetenceEvaluation({ userId, competenceId, competenceEvaluationRepository }) {
  return competenceEvaluationRepository.updateStatusByUserIdAndCompetenceId({
    competenceId, userId, status: CompetenceEvaluation.statuses.RESET
  });
}

module.exports = {
  resetCompetenceEvaluation,
};
