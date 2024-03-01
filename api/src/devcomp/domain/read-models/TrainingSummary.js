class TrainingSummary {
  constructor({ id, title, prerequisiteThreshold, goalThreshold, targetProfilesCount, isDisabled } = {}) {
    this.id = id;
    this.title = title;
    this.prerequisiteThreshold = prerequisiteThreshold;
    this.goalThreshold = goalThreshold;
    this.targetProfilesCount = targetProfilesCount;
    this.isDisabled = isDisabled;
  }
}

export { TrainingSummary };
