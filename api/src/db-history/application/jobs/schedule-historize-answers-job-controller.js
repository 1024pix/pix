import { config } from '../../../../config/config.js';
import { JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { getDatesOneYearEarlier } from '../../../shared/infrastructure/utils/date-utils.ts';
import { usecases } from '../../domain/usecases/index.js';

class ScheduleHistorizeAnswersJobController extends JobScheduleController {
  constructor() {
    super('ScheduleHistorizeAnswersJob', {
      description:
        'Historise périodiquement en fichiers parquet, sur le stockage objet, les réponses des évaluations terminées un an plus tôt jour pour jour.',
      team: JobTeam.STAFF,
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
