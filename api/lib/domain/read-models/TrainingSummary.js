class TrainingSummary {
  constructor({ id, title, isRecommendable } = {}) {
    this.id = id;
    this.title = title;
    this.isRecommendable = isRecommendable;
  }
}

module.exports = TrainingSummary;
