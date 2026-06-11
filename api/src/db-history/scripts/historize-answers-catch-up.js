import * as answersRepository from '../../../src/db-history/infrastructure/repositories/answers-repository.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { TARGET_STATE, TARGET_TYPES } from '../domain/constants.js';
import { usecases } from '../domain/usecases/index.js';

export class HistorizeAnswersCatchUpScript extends Script {
  constructor() {
    super({
      description: 'Historize answers from non-certification completed assessments for a given period of time',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          default: true,
        },
        startDate: {
          type: 'date',
          describe: 'First day of answer historization',
          required: true,
        },
        endDate: {
          type: 'date',
          describe: 'Last day of answer historization',
          required: true,
        },
      },
    });
  }

  async handle({ options, logger, dependencies = { answersRepository } }) {
    const { dryRun, startDate, endDate } = options;

    logger.info(`Executing answers historization between ${startDate} and ${endDate}`);
    let totalNumberOfAnswersToBeDeleted = 0;
    const dateOfScriptExecutionEnding = new Date(endDate);

    for (
      let currentDate = new Date(startDate);
      currentDate <= dateOfScriptExecutionEnding;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      if (dryRun) {
        const answersToBeDeleted = await dependencies.answersRepository.getAnswersByAssessmentTypeAndDateAndState({
          targetTypes: TARGET_TYPES,
          targetDate: currentDate,
          targetState: TARGET_STATE,
        });
        logger.info(`dryRun mode: ${answersToBeDeleted.length} answer(s) would be deleted for ${currentDate}`);
        totalNumberOfAnswersToBeDeleted += answersToBeDeleted.length;
      } else {
        try {
          logger.info(`Executing answers historization for ${currentDate}`);
          await usecases.historizeAnswers({ targetDate: currentDate });
        } catch (error) {
          logger.error(error);
          logger.info(`An error occurred while executing historization for ${currentDate}`);
          throw error;
        }
      }
    }

    if (dryRun) {
      logger.info(`dryRun mode: ${totalNumberOfAnswersToBeDeleted} answer(s) would be deleted`);
    }
  }
}
await ScriptRunner.execute(import.meta.url, HistorizeAnswersCatchUpScript);
