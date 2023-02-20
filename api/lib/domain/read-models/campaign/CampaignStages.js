import sortBy from 'lodash/sortBy';

export default class CampaignStages {
  constructor({ stages }) {
    this.stages = stages;
  }

  get reachableStages() {
    return this.stages.filter(({ threshold }) => threshold > 0);
  }

  get hasReachableStages() {
    return this.reachableStages.length > 0;
  }

  get stageThresholdBoundaries() {
    let lastTo = null;

    const stagesSort = sortBy(this.stages, 'threshold');

    return stagesSort.map((currentStage, index) => {
      let to, from;

      if (lastTo === null) {
        from = currentStage.threshold;
      } else {
        from = lastTo + 1;
      }

      if (index + 1 >= stagesSort.length) {
        to = 100;
      } else {
        const nextThreshold = stagesSort[index + 1].threshold;
        to = Math.max(from, nextThreshold - 1);
      }

      lastTo = to;
      return { id: currentStage.id, from, to };
    });
  }
}
