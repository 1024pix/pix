const FALLBACK_STAGE = {
  id: -1,
  title: '',
  message: '',
  threshold: 0,
};

class ReachedStage {
  static FALLBACK_STAGE = FALLBACK_STAGE;

  constructor(masteryRate, stages) {
    const stagesOrdered = stages.sort((a, b) => a.threshold - b.threshold);
    const stagesReached = stagesOrdered.filter(({ threshold }) => threshold <= masteryRate * 100);
    const lastStageReached = stagesReached[stagesReached.length - 1] || FALLBACK_STAGE;

    this.id = lastStageReached.id;
    this.title = lastStageReached.title;
    this.message = lastStageReached.message;
    this.threshold = lastStageReached.threshold;
    this.starCount = stagesReached.length;
  }
}

module.exports = ReachedStage;
