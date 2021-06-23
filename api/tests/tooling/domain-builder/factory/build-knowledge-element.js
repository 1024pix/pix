const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

const buildKnowledgeElement = function({
  source = KnowledgeElement.SourceType.DIRECT,
  status = KnowledgeElement.StatusType.VALIDATED,
  earnedPix = 4,
  createdAt,
  answerId = 456,
  assessmentId = 789,
  skillId = 'recSKIL123',
  userId = 159,
  competenceId = 'recCOMP456',
} = {}) {
  return new KnowledgeElement({
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

buildKnowledgeElement.directlyValidated = function({
  earnedPix = 4,
  createdAt,
  answerId = 456,
  assessmentId = 789,
  skillId = 'recSKIL123',
  userId = 159,
  competenceId = 'recCOMP456',
} = {}) {
  return new KnowledgeElement({
    source: KnowledgeElement.SourceType.DIRECT,
    status: KnowledgeElement.StatusType.VALIDATED,
    earnedPix,
    createdAt,
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId,
  });
};

buildKnowledgeElement.directlyInvalidated = function({
  earnedPix = 4,
  createdAt,
  answerId = 456,
  assessmentId = 789,
  skillId = 'recSKIL123',
  userId = 159,
  competenceId = 'recCOMP456',
} = {}) {
  return new KnowledgeElement({
    source: KnowledgeElement.SourceType.DIRECT,
    status: KnowledgeElement.StatusType.INVALIDATED,
    earnedPix,
    createdAt,
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId,
  });
};

buildKnowledgeElement.inferredValidated = function({
  earnedPix = 4,
  createdAt,
  answerId = 456,
  assessmentId = 789,
  skillId = 'recSKIL123',
  userId = 159,
  competenceId = 'recCOMP456',
} = {}) {
  return new KnowledgeElement({
    source: KnowledgeElement.SourceType.INFERRED,
    status: KnowledgeElement.StatusType.VALIDATED,
    earnedPix,
    createdAt,
    answerId,
    assessmentId,
    skillId,
    userId,
    competenceId,
  });
};

module.exports = buildKnowledgeElement;
