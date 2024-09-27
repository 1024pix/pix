import cronParser from 'cron-parser';
import dayjs from 'dayjs';

import * as organizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { ComputeCertificabilityJob } from '../../../../prescription/learner-management/domain/models/ComputeCertificabilityJob.js';
import { JobScheduleController } from '../../../../shared/application/jobs/job-schedule-controller.js';
import { config } from '../../../../shared/config.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { computeCertificabilityJobRepository } from '../../../learner-management/infrastructure/repositories/jobs/compute-certificability-job-repository.js';

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
    data = {},
    dependencies = { organizationLearnerRepository, computeCertificabilityJobRepository, config, logger },
  }) {
    const skipLoggedLastDayCheck = data?.skipLoggedLastDayCheck;
    const onlyNotComputed = data?.onlyNotComputed;
    const chunkSize = dependencies.config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize;
    const cronConfig = dependencies.config.features.scheduleComputeOrganizationLearnersCertificability.cron;

    const isolationLevel = 'repeatable read';

    const parsedCron = cronParser.parseExpression(cronConfig, { tz: 'Europe/Paris' });
    const toUserActivityDate = parsedCron.prev().toDate();

    const fromUserActivityDate = dayjs(toUserActivityDate).subtract(1, 'day').toDate();

    return await DomainTransaction.execute(
      async () => {
        const count =
          await dependencies.organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
            skipLoggedLastDayCheck,
            fromUserActivityDate,
            toUserActivityDate,
            onlyNotComputed,
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
              skipLoggedLastDayCheck,
              onlyNotComputed,
            });

          dependencies.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Ids count  : ${organizationLearnerIds.length}`,
          );

          const jobsToInsert = organizationLearnerIds.map(
            (organizationLearnerId) => new ComputeCertificabilityJob({ organizationLearnerId }),
          );

          const jobsInserted = await dependencies.computeCertificabilityJobRepository.performAsync(...jobsToInsert);
          totalJobsInserted += jobsInserted.rowCount;

          dependencies.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Jobs inserted count  : ${jobsInserted.rowCount}`,
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
