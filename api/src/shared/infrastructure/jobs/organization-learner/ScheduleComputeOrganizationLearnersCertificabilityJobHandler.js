import cronParser from 'cron-parser';
import dayjs from 'dayjs';

import { DomainTransaction } from '../../../domain/DomainTransaction.js';
import { ComputeCertificabilityJob } from './ComputeCertificabilityJob.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJob } from './ScheduleComputeOrganizationLearnersCertificabilityJob.js';

class ScheduleComputeOrganizationLearnersCertificabilityJobHandler {
  constructor({ organizationLearnerRepository, pgBossRepository, config, logger }) {
    this.organizationLearnerRepository = organizationLearnerRepository;
    this.pgBossRepository = pgBossRepository;
    this.config = config;
    this.logger = logger;
  }

  async handle(event = {}) {
    const skipLoggedLastDayCheck = event?.skipLoggedLastDayCheck;
    const onlyNotComputed = event?.onlyNotComputed;
    const chunkSize = this.config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize;
    const cronConfig = this.config.features.scheduleComputeOrganizationLearnersCertificability.cron;

    const isolationLevel = 'repeatable read';

    const parsedCron = cronParser.parseExpression(cronConfig, { tz: 'Europe/Paris' });
    const toUserActivityDate = parsedCron.prev().toDate();

    const fromUserActivityDate = dayjs(toUserActivityDate).subtract(1, 'day').toDate();

    return await DomainTransaction.execute(
      async () => {
        const count = await this.organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
          skipLoggedLastDayCheck,
          fromUserActivityDate,
          toUserActivityDate,
          onlyNotComputed,
        });

        const chunkCount = Math.ceil(count / chunkSize);
        this.logger.info(
          `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Total learners to compute : ${count}`,
        );

        let totalJobsInserted = 0;

        for (let index = 0; index < chunkCount; index++) {
          const offset = index * chunkSize;
          this.logger.info(`ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Offset : ${offset}`);

          const organizationLearnerIds =
            await this.organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
              limit: chunkSize,
              offset,
              fromUserActivityDate,
              toUserActivityDate,
              skipLoggedLastDayCheck,
              onlyNotComputed,
            });

          this.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Ids count  : ${organizationLearnerIds.length}`,
          );

          const jobsToInsert = organizationLearnerIds.map((organizationLearnerId) => ({
            name: ComputeCertificabilityJob.name,
            data: { organizationLearnerId },
            retrylimit: 0,
            retrydelay: 30,
            on_complete: true,
          }));

          const jobsInserted = await this.pgBossRepository.insert(jobsToInsert);
          totalJobsInserted += jobsInserted.rowCount;

          this.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Jobs inserted count  : ${jobsInserted.rowCount}`,
          );
        }

        this.logger.info(
          `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Total jobs inserted count : ${totalJobsInserted}`,
        );
      },
      { isolationLevel },
    );
  }

  get name() {
    return ScheduleComputeOrganizationLearnersCertificabilityJob.name;
  }
}

export { ScheduleComputeOrganizationLearnersCertificabilityJobHandler };
