import { CronExpressionParser } from 'cron-parser';
import dayjs from 'dayjs';

import { config } from '../../../../../config/config.js';
import { ComputeCertificabilityJob } from '../../../../prescription/learner-management/domain/models/jobs/ComputeCertificabilityJob.js';
import { JobScheduleController } from '../../../../shared/application/jobs/job-schedule-controller.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { computeCertificabilityJobRepository } from '../../../learner-management/infrastructure/repositories/jobs/compute-certificability-job-repository.js';
import * as organizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { usecases } from '../../domain/usecases/index.js';

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
    const {
      chunkSize,
      cron: cronConfig,
      synchronously,
    } = dependencies.config.features.scheduleComputeOrganizationLearnersCertificability;

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

          if (synchronously) {
            for (const organizationLearnerId of organizationLearnerIds) {
              await usecases.computeOrganizationLearnerCertificability({ organizationLearnerId });
            }

            dependencies.logger.info(
              `ScheduleComputeOrganizationLearnersCertificabilityJobHandler - Certificability computed count : ${organizationLearnerIds.length}`,
            );
            continue;
          }

          for (const organizationLearnerId of organizationLearnerIds) {
            await dependencies.computeCertificabilityJobRepository.performAsync(
              new ComputeCertificabilityJob({ organizationLearnerId }),
            );
            totalJobsInserted += 1;
          }

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
