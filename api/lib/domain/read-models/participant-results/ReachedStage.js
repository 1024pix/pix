class ReachedStage {

  constructor(masteryPercentage, stages) {
    const stagesOrdered = stages.sort((a, b) => a.threshold - b.threshold);
    const stagesReached = stagesOrdered.filter(({ threshold }) => threshold <= masteryPercentage);
    const lastStageReached = stagesReached[stagesReached.length - 1];

    this.id = lastStageReached.id;
    this.title = lastStageReached.title;
    this.message = lastStageReached.message;
    this.threshold = lastStageReached.threshold;

    this.starCount = stagesReached.length;
  }
}

module.exports = ReachedStage;
