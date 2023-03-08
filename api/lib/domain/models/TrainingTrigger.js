const types = {
  PREREQUISITE: 'prerequisite',
  GOAL: 'goal',
};

class TrainingTrigger {
  constructor({ id, trainingId, triggerTubes, type, threshold, areas = [], competences = [], thematics = [] } = {}) {
    this.id = id;
    this.trainingId = trainingId;
    this.triggerTubes = triggerTubes;
    if (!Object.values(types).includes(type)) {
      throw new Error('Invalid trigger type');
    }
    this.type = type;
    this.threshold = threshold;
    this.areas = areas;
    this.competences = competences;
    this.thematics = thematics;
  }
}

TrainingTrigger.types = types;

module.exports = TrainingTrigger;
