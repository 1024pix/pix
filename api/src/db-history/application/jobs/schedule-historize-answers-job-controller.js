import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { config } from '../../../shared/config.js';
import { usecases } from '../../domain/usecases/index.js';
import { getDatesOneYearEarlier } from './date-utils.js';

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
