export class AssessmentSimulator {
  constructor({ getStrategy }) {
    this.getStrategy = getStrategy;
  }

  run(
    { challengesAnswers = [], startCapacityDegradationAt = 32 } = {
      challengesAnswers: [],
      startCapacityDegradationAt: 32,
    },
  ) {
    const result = [];

    let stepIndex = 0;

    // eslint-disable-next-line no-constant-condition
    while (this._shouldRunSimulator(startCapacityDegradationAt, stepIndex)) {
      try {
        const simulatorStepResult = this.getStrategy(stepIndex).run({ challengesAnswers, stepIndex });

        if (!simulatorStepResult) {
          break;
        }
        stepIndex = simulatorStepResult.nextStepIndex;
        challengesAnswers.push(...simulatorStepResult.challengeAnswers);
        result.push(...simulatorStepResult.results);
      } catch (err) {
        break;
      }
    }

    return result;
  }

  _shouldRunSimulator(startCapacityDegradationAt, stepIndex) {
    return startCapacityDegradationAt ? stepIndex < startCapacityDegradationAt : true;
  }
}
