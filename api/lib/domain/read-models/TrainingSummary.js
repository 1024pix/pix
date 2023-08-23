class TrainingSummary {
  constructor({ id, title, prerequisiteThreshold, goalThreshold } = {}) {
    this.id = id;
    this.title = title;
    this.prerequisiteThreshold = prerequisiteThreshold;
    this.goalThreshold = goalThreshold;
  }
}

export { TrainingSummary };
