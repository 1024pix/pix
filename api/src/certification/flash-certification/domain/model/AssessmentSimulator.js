export class AssessmentSimulator {
  constructor({ strategy }) {
    this.strategy = strategy;
  }

  run() {
    const challengesAnswers = [];
    const result = [];

    for (let i = 0; i < Infinity; i++) {
      try {
        const simulatorStepResult = this.strategy.run({ challengesAnswers, stepIndex: i });

        if (!simulatorStepResult) {
          break;
        }

        challengesAnswers.push(...simulatorStepResult.challengeAnswers);
        result.push(...simulatorStepResult.results);
      } catch (err) {
        break;
      }
    }

    return result;
  }
}
