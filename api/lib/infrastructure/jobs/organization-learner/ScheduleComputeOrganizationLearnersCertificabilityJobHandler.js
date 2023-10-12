import { ScheduleComputeOrganizationLearnersCertificabilityJob } from './ScheduleComputeOrganizationLearnersCertificabilityJob.js';
import { ComputeCertificabilityJob } from './ComputeCertificabilityJob.js';
import { DomainTransaction } from '../../DomainTransaction.js';

class ScheduleComputeOrganizationLearnersCertificabilityJobHandler {
  constructor({ organizationLearnerRepository, pgBossRepository, config }) {
    this.organizationLearnerRepository = organizationLearnerRepository;
    this.pgBossRepository = pgBossRepository;
    this.config = config;
  }

  async handle(event = {}) {
    const skipLoggedLastDayCheck = event?.skipLoggedLastDayCheck;
    const onlyNotComputed = event?.onlyNotComputed;
    const chunkSize = this.config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize;
    await DomainTransaction.execute(async (domainTransaction) => {
      const count = await this.organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
        skipLoggedLastDayCheck,
        onlyNotComputed,
        domainTransaction,
      });
      const chunkCount = Math.ceil(count / chunkSize);

      for (let index = 0; index < chunkCount; index++) {
        const organizationLearnerIds =
          await this.organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
            limit: chunkSize,
            offset: index * chunkSize,
            skipLoggedLastDayCheck,
            onlyNotComputed,
            domainTransaction,
          });

        const jobsToInsert = organizationLearnerIds.map((organizationLearnerId) => ({
          name: ComputeCertificabilityJob.name,
          data: { organizationLearnerId },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        }));

        await this.pgBossRepository.insert(jobsToInsert, domainTransaction);
      }
    });
  }

  get name() {
    return ScheduleComputeOrganizationLearnersCertificabilityJob.name;
  }
}

export { ScheduleComputeOrganizationLearnersCertificabilityJobHandler };
