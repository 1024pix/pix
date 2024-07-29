import { logger } from '../../../../shared/infrastructure/utils/logger.js';

export class AssessmentSimulator {
  constructor({ getStrategy }) {
    this.getStrategy = getStrategy;
  }

  run({ challengesAnswers } = { challengesAnswers: [] }) {
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
      } catch (error) {
        logger.error(error);
        break;
      }
    }

    logger.trace({ result }, 'AssessmentSimulator result');
    return result;
  }
}
