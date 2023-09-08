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
    let skipLoggedLastDayCheck = false;
    if (event) skipLoggedLastDayCheck = event.skipLoggedLastDayCheck;
    const chunkSize = this.config.features.scheduleComputeOrganizationLearnersCertificability.chunkSize;
    const count = await this.organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability({
      skipLoggedLastDayCheck,
    });
    const chunkCount = Math.ceil(count / chunkSize);

    await DomainTransaction.execute(async (domainTransaction) => {
      for (let index = 0; index < chunkCount; index++) {
        const organizationLearnerIds =
          await this.organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability({
            limit: chunkSize,
            offset: index * chunkSize,
            skipLoggedLastDayCheck,
          });
        await this.pgBossRepository.insert(
          organizationLearnerIds.map(
            (organizationLearnerId) => ({
              name: ComputeCertificabilityJob.name,
              data: { organizationLearnerId },
              retrylimit: 0,
              retrydelay: 30,
              on_complete: true,
            }),
            domainTransaction,
          ),
        );
      }
    });
  }

  get name() {
    return ScheduleComputeOrganizationLearnersCertificabilityJob.name;
  }
}

export { ScheduleComputeOrganizationLearnersCertificabilityJobHandler };
