import { getAssessmentIdsByAssessmentTypeAndDateAndState } from '../../../src/db-history/infrastructure/repositories/assessments-repository.js';
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

  async handle({ options, logger }) {
    const { dryRun, startDate, endDate } = options;

    logger.info(`Executing answers historization between ${startDate} and ${endDate}`);
    let totalNumberOfAssessmentsProcessed = 0;
    const dateOfScriptExecutionEnding = new Date(endDate);

    for (
      let currentDate = new Date(startDate);
      currentDate <= dateOfScriptExecutionEnding;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      if (dryRun) {
        const assessmentIds = await getAssessmentIdsByAssessmentTypeAndDateAndState({
          targetTypes: TARGET_TYPES,
          targetState: TARGET_STATE,
          targetDate: currentDate,
        });
        totalNumberOfAssessmentsProcessed += assessmentIds.length;
        logger.info(`dryRun mode: ${assessmentIds.length} assessments will be processed for ${currentDate}`);
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
      logger.info(`dryRun mode: ${totalNumberOfAssessmentsProcessed} assessments have been processed`);
    }
  }
}
await ScriptRunner.execute(import.meta.url, HistorizeAnswersCatchUpScript);
