import { CronExpressionParser } from 'cron-parser';
import dayjs from 'dayjs';

import { config } from '../../../../../config/config.js';
import { JobScheduleController } from '../../../../shared/application/jobs/job-schedule-controller.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import * as organizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { ComputeOrganizationLearnerCertificabilityJobProvidedDateError } from '../../domain/errors.js';
import { ComputeCertificabilityJob } from '../../domain/models/jobs/ComputeCertificabilityJob.js';
import { usecases } from '../../domain/usecases/index.js';
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
    data = {},
    dependencies = { organizationLearnerRepository, computeCertificabilityJobRepository, config, logger },
  }) {
    const skipActivityDate = data?.skipActivityDate;
    const onlyNotComputed = data?.onlyNotComputed;
    const providedDateRange = data?.providedDateRange;

    if (providedDateRange) {
      dependencies.logger.info(
        `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - providedDateRange : ${providedDateRange.startDate}-${providedDateRange.endDate}`,
      );
    }

    const {
      chunkSize,
      cron: cronConfig,
      synchronously,
    } = dependencies.config.features.scheduleComputeOrganizationLearnersCertificability;

    const isolationLevel = 'repeatable read';

    let toUserActivityDate, fromUserActivityDate;
    if (providedDateRange && providedDateRange.startDate && providedDateRange.endDate) {
      const parseStartDate = dayjs(providedDateRange.startDate, 'YYYY-MM-DD');
      const parseEndDate = dayjs(providedDateRange.endDate, 'YYYY-MM-DD');
      if (!parseStartDate.isValid() || !parseEndDate.isValid() || parseStartDate.isAfter(parseEndDate)) {
        throw new ComputeOrganizationLearnerCertificabilityJobProvidedDateError();
      }
      fromUserActivityDate = parseStartDate.toDate();
      toUserActivityDate = parseEndDate.toDate();
    } else {
      const parsedCron = CronExpressionParser.parse(cronConfig, { tz: 'Europe/Paris' });
      toUserActivityDate = parsedCron.prev().toDate();
      fromUserActivityDate = dayjs(toUserActivityDate).subtract(1, 'day').toDate();
    }

    return await DomainTransaction.execute(
      async () => {
        const count =
          await dependencies.organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
            skipActivityDate,
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
              skipActivityDate,
              onlyNotComputed,
            });

          dependencies.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Ids count  : ${organizationLearnerIds.length}`,
          );

          if (synchronously) {
            for (const organizationLearnerId of organizationLearnerIds) {
              await usecases.computeOrganizationLearnerCertificability({ organizationLearnerId });
            }

            dependencies.logger.info(
              `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Certificability computed count : ${organizationLearnerIds.length}`,
            );
            continue;
          }

          const jobs = organizationLearnerIds.map(
            (organizationLearnerId) => new ComputeCertificabilityJob({ organizationLearnerId }),
          );
          await dependencies.computeCertificabilityJobRepository.performManyAsync(jobs);
          totalJobsInserted += jobs.length;
          dependencies.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Jobs inserted count  : ${totalJobsInserted}`,
          );
        }

        if (synchronously) {
          dependencies.logger.info(
            `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Total certificability computed count : ${totalJobsInserted}`,
          );

          return;
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
