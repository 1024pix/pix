import { ComputeCertificabilityJob } from './ComputeCertificabilityJob.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJob } from './ScheduleComputeOrganizationLearnersCertificabilityJob.js';

class ScheduleComputeOrganizationLearnersCertificabilityJobHandler {
  constructor({ organizationLearnerRepository, pgBoss }) {
    this.organizationLearnerRepository = organizationLearnerRepository;
    this.pgBoss = pgBoss;
  }

  async handle() {
    const organizationLearnerIds =
      await this.organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability();

    await this.pgBoss.insert(
      organizationLearnerIds.map((organizationLearnerId) => ({
        name: ComputeCertificabilityJob.name,
        data: { organizationLearnerId },
        retryLimit: 0,
        retryDelay: 30,
        on_complete: true,
      })),
    );
  }

  get name() {
    return ScheduleComputeOrganizationLearnersCertificabilityJob.name;
  }
}

export { ScheduleComputeOrganizationLearnersCertificabilityJobHandler };
