const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

module.exports = function buildKnowledgeElement({
  id = 123,
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  earnedPix = 4,
  createdAt,
  // relationship Ids
  answerId = 456,
  assessmentId = 789,
  skillId = 'recSKIL123',
  userId = 159,
  competenceId = 'recCOMP456',
} = {}) {
  return new KnowledgeElement({
    id,
    source,
    status,
    earnedPix,
    createdAt,
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId,
  });
};
