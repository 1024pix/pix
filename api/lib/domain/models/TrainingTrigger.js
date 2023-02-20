const types = {
  PREREQUISITE: 'prerequisite',
  GOAL: 'goal',
};

class TrainingTrigger {
  constructor({ id, trainingId, tubes, type, threshold } = {}) {
    this.id = id;
    this.trainingId = trainingId;
    this.tubes = tubes;
    if (!Object.values(types).includes(type)) {
      throw new Error('Invalid trigger type');
    }
    this.type = type;
    this.threshold = threshold;
  }
}

TrainingTrigger.types = types;

export default TrainingTrigger;
