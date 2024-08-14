import { logger } from '../../../../shared/infrastructure/utils/logger.js';

export class AssessmentSimulator {
  constructor({ getStrategy }) {
    this.getStrategy = getStrategy;
  }

  run({ challengesAnswers } = { challengesAnswers: [] }) {
    const result = [];

    let stepIndex = 0;
    let hasNextAnswer;

    do {
      hasNextAnswer = false;

      const simulatorStepResult = this.getStrategy(stepIndex).run({ challengesAnswers, stepIndex });
      if (simulatorStepResult) {
        stepIndex = simulatorStepResult.nextStepIndex;
        challengesAnswers.push(...simulatorStepResult.challengeAnswers);
        result.push(...simulatorStepResult.results);

        hasNextAnswer = true;
      }
    } while (hasNextAnswer);

    logger.trace({ result }, 'AssessmentSimulator result');
    return result;
  }
}
