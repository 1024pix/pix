import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import { JobScheduleController } from '../../../../shared/application/jobs/job-schedule-controller.js';
import { config } from '../../../../shared/config.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CpfExportBuilderJob } from '../../domain/models/CpfExportBuilderJob.js';
import * as cpfCertificationResultRepository from '../../infrastructure/repositories/cpf-certification-result-repository.js';
import { cpfExportBuilderJobRepository } from '../../infrastructure/repositories/jobs/cpf-export-builder-job-repository.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const { plannerJob } = config.cpf;

class CpfExportPlannerJobController extends JobScheduleController {
  constructor() {
    super('CpfExportPlannerJob', { jobCron: config.cpf.plannerJob.cron });
  }

  async handle({ jobId, dependencies = { cpfCertificationResultRepository, cpfExportBuilderJobRepository, logger } }) {
    const startDate = dayjs()
      .utc()
      .subtract(plannerJob.minimumReliabilityPeriod + (plannerJob.monthsToProcess - 1), 'months')
      .startOf('month')
      .toDate();
    const endDate = dayjs().utc().subtract(plannerJob.minimumReliabilityPeriod, 'months').endOf('month').toDate();

    const cpfCertificationResultCount =
      await dependencies.cpfCertificationResultRepository.countExportableCertificationCoursesByTimeRange({
        startDate,
        endDate,
      });
    const cpfCertificationResultChunksCount = Math.ceil(cpfCertificationResultCount / plannerJob.chunkSize);

    dependencies.logger.info(
      `Start from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}, plan ${cpfCertificationResultChunksCount} job(s) for ${cpfCertificationResultCount} certifications`,
    );

    const newJobs = [];
    for (let index = 0; index < cpfCertificationResultChunksCount; index++) {
      const batchId = `${jobId}#${index}`;
      await dependencies.cpfCertificationResultRepository.markCertificationToExport({
        startDate,
        endDate,
        limit: plannerJob.chunkSize,
        offset: index * plannerJob.chunkSize,
        batchId,
      });

      newJobs.push(batchId);
      dependencies.logger.info(`${batchId} created for (${index + 1}/${cpfCertificationResultChunksCount})`);
    }

    await dependencies.cpfExportBuilderJobRepository.performAsync(
      ...newJobs.map((batchId) => new CpfExportBuilderJob({ batchId })),
    );
  }
}

export { CpfExportPlannerJobController };
