import { ScheduleComputeOrganizationLearnersCertificabilityJob } from './ScheduleComputeOrganizationLearnersCertificabilityJob.js';
import { ComputeCertificabilityJob } from './ComputeCertificabilityJob.js';
import { knex } from '../../../../db/knex-database-connection.js';
import dayjs from 'dayjs';
import cronParser from 'cron-parser';

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

    await knex.transaction(
      async (trx) => {
        const count = await this.organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
          skipLoggedLastDayCheck,
          fromUserActivityDate,
          toUserActivityDate,
          onlyNotComputed,
          domainTransaction: { knexTransaction: trx },
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
              domainTransaction: { knexTransaction: trx },
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

          const jobsInserted = await this.pgBossRepository.insert(jobsToInsert, { knexTransaction: trx });
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
