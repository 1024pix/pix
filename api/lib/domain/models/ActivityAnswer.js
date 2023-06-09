class ActivityAnswer {
  constructor({ id, challengeId, activityId, value, result, resultDetails } = {}) {
    this.id = id;
    this.challengeId = challengeId;
    this.activityId = activityId;
    this.value = value;
    this.result = result;
    this.resultDetails = resultDetails;
  }
}

export { ActivityAnswer };
