import { config } from '../../../../config/config.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { getDatesOneYearEarlier } from '../../../shared/infrastructure/utils/date-utils.js';
import { usecases } from '../../domain/usecases/index.js';

class ScheduleHistorizeAnswersJobController extends JobScheduleController {
  constructor() {
    super('ScheduleHistorizeAnswersJob', {
      jobCron: config.features.databaseHistory.scheduleHistorizeAnswers.cron,
    });
  }

  async handle() {
    const oneYearEarlierDates = getDatesOneYearEarlier(new Date());

    for (const date of oneYearEarlierDates) {
      await usecases.historizeAnswers({ targetDate: date });
    }
  }
}

export { ScheduleHistorizeAnswersJobController };
