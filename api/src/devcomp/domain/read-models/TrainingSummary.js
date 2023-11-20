class TrainingSummary {
  constructor({ id, title, prerequisiteThreshold, goalThreshold, targetProfilesCount } = {}) {
    this.id = id;
    this.title = title;
    this.prerequisiteThreshold = prerequisiteThreshold;
    this.goalThreshold = goalThreshold;
    this.targetProfilesCount = targetProfilesCount;
  }
}

export { TrainingSummary };
