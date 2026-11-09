import { CronExpressionParser } from 'cron-parser';
import dayjs from 'dayjs';

import { config } from '../../../../../config/config.js';
import { JobScheduleController } from '../../../../shared/application/jobs/job-schedule-controller.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import * as organizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { ComputeCertificabilityJob } from '../../domain/models/jobs/ComputeCertificabilityJob.js';
import { computeCertificabilityJobRepository } from '../../infrastructure/repositories/jobs/compute-certificability-job-repository.js';

class ScheduleComputeOrganizationLearnersCertificabilityJobController extends JobScheduleController {
  constructor() {
    super('ScheduleComputeOrganizationLearnersCertificabilityJob', {
      jobCron: config.features.scheduleComputeOrganizationLearnersCertificability.cron,
    });
  }

  get legacyName() {
    return 'ComputeOrganizationLearnersCertificabilityJob';
  }

  async handle({
    dependencies = { organizationLearnerRepository, computeCertificabilityJobRepository, config, logger },
  }) {
    const { chunkSize, cron: cronConfig } =
      dependencies.config.features.scheduleComputeOrganizationLearnersCertificability;

    const isolationLevel = 'repeatable read';

    const parsedCron = CronExpressionParser.parse(cronConfig, { tz: 'Europe/Paris' });
    const toUserActivityDate = parsedCron.prev().toDate();
    const fromUserActivityDate = dayjs(toUserActivityDate).subtract(1, 'day').toDate();

    return await DomainTransaction.execute(
      async () => {
        const count =
          await dependencies.organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
            fromUserActivityDate,
            toUserActivityDate,
          });

        const chunkCount = Math.ceil(count / chunkSize);
        dependencies.logger.info(
          `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Total learners to compute : ${count}`,
        );

        let totalJobsInserted = 0;

        for (let index = 0; index < chunkCount; index++) {
          const offset = index * chunkSize;
          dependencies.logger.info(`ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Offset : ${offset}`);

          const organizationLearnerIds =
            await dependencies.organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
              limit: chunkSize,
              offset,
              fromUserActivityDate,
              toUserActivityDate,
            });

          dependencies.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Ids count  : ${organizationLearnerIds.length}`,
          );

          const jobs = organizationLearnerIds.map(
            (organizationLearnerId) => new ComputeCertificabilityJob({ organizationLearnerId }),
          );
          await dependencies.computeCertificabilityJobRepository.performManyAsync(jobs);
          totalJobsInserted += jobs.length;
          dependencies.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Jobs inserted count  : ${totalJobsInserted}`,
          );
        }

        dependencies.logger.info(
          `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Total jobs inserted count : ${totalJobsInserted}`,
        );
      },
      { isolationLevel },
    );
  }
}

export { ScheduleComputeOrganizationLearnersCertificabilityJobController };
