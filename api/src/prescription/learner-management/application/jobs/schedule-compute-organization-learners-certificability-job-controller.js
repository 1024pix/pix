import cronParser from 'cron-parser';
import dayjs from 'dayjs';

import * as organizationLearnerRepository from '../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import * as pgBossRepository from '../../../../../lib/infrastructure/repositories/pgboss-repository.js';
import { ComputeCertificabilityJob } from '../../../../prescription/learner-management/domain/models/ComputeCertificabilityJob.js';
import { config } from '../../../../shared/config.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

class ScheduleComputeOrganizationLearnersCertificabilityJobController {
  async handle(event = {}, dependencies = { organizationLearnerRepository, pgBossRepository, config, logger }) {
    const skipLoggedLastDayCheck = event?.skipLoggedLastDayCheck;
    const onlyNotComputed = event?.onlyNotComputed;
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

          const jobsToInsert = organizationLearnerIds.map((organizationLearnerId) => ({
            name: ComputeCertificabilityJob.name,
            data: new ComputeCertificabilityJob({ organizationLearnerId }),
            retrylimit: 0,
            retrydelay: 30,
            on_complete: true,
          }));

          const jobsInserted = await dependencies.pgBossRepository.insert(jobsToInsert);
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
