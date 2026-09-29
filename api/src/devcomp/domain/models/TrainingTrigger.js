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

  isFulfilled({ knowledgeState, skills } = {}) {
    const cappedSkills = this.triggerTubes.map((triggerTube) => triggerTube.getCappedSkills(skills)).flat();
    const validatedPercentage = _getValidatedPercentage({ knowledgeState, cappedSkills });
    if (this.type === types.GOAL) {
      return validatedPercentage <= this.threshold;
    }

    return validatedPercentage >= this.threshold;
  }
}

TrainingTrigger.types = types;

/** La part validée de ce qui a été évalué dans le périmètre du déclencheur. */
function _getValidatedPercentage({ knowledgeState, cappedSkills }) {
  const assessedCount = knowledgeState.assessedSkills(cappedSkills).length;
  if (assessedCount === 0) return 0;

  const validatedCount = knowledgeState.validatedSkills(cappedSkills).length;
  return Math.round((validatedCount / assessedCount) * 100);
}

export { TrainingTrigger };
