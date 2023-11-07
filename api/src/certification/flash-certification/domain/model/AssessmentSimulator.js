export class AssessmentSimulator {
  constructor({ strategy }) {
    this.strategy = strategy;
  }

  run() {
    let challengesAnswers = [];
    const result = [];

    for (let i = 0; i < Infinity; i++) {
      try {
        const simulatorStepResult = this.strategy.run({ challengesAnswers, stepIndex: i });

        if (!simulatorStepResult) {
          break;
        }

        challengesAnswers = simulatorStepResult.challengesAnswers;
        result.push(simulatorStepResult.result);
      } catch (err) {
        break;
      }
    }

    return result;
  }
}
