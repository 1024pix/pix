const types = {
  PREREQUISITE: 'prerequisite',
  GOAL: 'goal',
};

class TrainingTrigger {
  constructor({ id, trainingId, triggerTubes, type, threshold } = {}) {
    this.id = id;
    this.trainingId = trainingId;
    this.triggerTubes = triggerTubes;
    if (!Object.values(types).includes(type)) {
      throw new Error('Invalid trigger type');
    }
    this.type = type;
    this.threshold = threshold;
  }
}

TrainingTrigger.types = types;

module.exports = TrainingTrigger;
