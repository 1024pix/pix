export class AssessmentSimulator {
  constructor({ getStrategy }) {
    this.getStrategy = getStrategy;
  }

  run() {
    const challengesAnswers = [];
    const result = [];

    let stepIndex = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
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
}
