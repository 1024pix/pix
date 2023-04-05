const types = {
  PREREQUISITE: 'prerequisite',
  GOAL: 'goal',
};

class TrainingTrigger {
  constructor({ id, trainingId, triggerTubes, type, threshold } = {}) {
    this.id = id;
    this.trainingId = trainingId;
    if (!Object.values(types).includes(type)) {
      throw new Error('Invalid trigger type');
    }
    this.type = type;
    this.threshold = threshold;
    this.triggerTubes = triggerTubes;
  }

  isFulfilled({ knowledgeElements, skills } = {}) {
    const cappedSkills = this.triggerTubes.map((triggerTube) => triggerTube.getCappedSkills(skills)).flat();
    const cappedKnowledgeElements = _getCappedKnowledgeElements({ knowledgeElements, cappedSkills });
    const validatedKnowledgeElementsPercentage = _getValidatedKnowledgeElementsPercentage({
      knowledgeElements: cappedKnowledgeElements,
    });
    if (this.type === types.GOAL) {
      return validatedKnowledgeElementsPercentage <= this.threshold;
    }

    return validatedKnowledgeElementsPercentage >= this.threshold;
  }
}

TrainingTrigger.types = types;

function _getCappedKnowledgeElements({ knowledgeElements, cappedSkills }) {
  const skillIds = cappedSkills.map((skill) => skill.id);
  return knowledgeElements.filter((knowledgeElement) => skillIds.includes(knowledgeElement.skillId));
}

function _getValidatedKnowledgeElementsPercentage({ knowledgeElements }) {
  if (knowledgeElements.length === 0) return 0;

  const validatedKnowledgeElementsCount = _getValidatedKnowledgeElementsCount({ knowledgeElements });
  return Math.round((validatedKnowledgeElementsCount / knowledgeElements.length) * 100);
}

function _getValidatedKnowledgeElementsCount({ knowledgeElements }) {
  return knowledgeElements.filter((knowledgeElement) => knowledgeElement.isValidated).length;
}

module.exports = TrainingTrigger;
