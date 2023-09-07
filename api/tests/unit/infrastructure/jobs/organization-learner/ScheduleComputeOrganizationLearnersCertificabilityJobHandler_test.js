import { expect, sinon } from '../../../../test-helper.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJobHandler } from '../../../../../lib/infrastructure/jobs/organization-learner/ScheduleComputeOrganizationLearnersCertificabilityJobHandler.js';

describe('Unit | Infrastructure | Jobs | scheduleComputeOrganizationLearnersCertificabilityJobHandler', function () {
  context('#handle', function () {
    it('should schedule multiple ComputeCertificabilityJob', async function () {
      // given
      const pgBossRepository = {
        insert: sinon.stub(),
      };
      const organizationLearnerRepository = {
        findByOrganizationsWhichNeedToComputeCertificability: sinon.stub(),
        countByOrganizationsWhichNeedToComputeCertificability: sinon.stub(),
      };
      const config = {
        features: {
          scheduleComputeOrganizationLearnersCertificability: {
            chunkSize: 2,
          },
        },
      };
      organizationLearnerRepository.countByOrganizationsWhichNeedToComputeCertificability.resolves(3);
      organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
        .withArgs({ limit: 2, offset: 0 })
        .resolves([1, 2]);
      organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability
        .withArgs({ limit: 2, offset: 2 })
        .resolves([3]);
      const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
        new ScheduleComputeOrganizationLearnersCertificabilityJobHandler({
          pgBossRepository,
          organizationLearnerRepository,
          config,
        });

      // when
      await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle();

      // then
      expect(pgBossRepository.insert.getCall(0).args[0]).to.be.deep.equal([
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 1 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 2 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
      ]);
      expect(pgBossRepository.insert.getCall(1).args[0]).to.be.deep.equal([
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 3 },
          retrylimit: 0,
          retrydelay: 30,
          on_complete: true,
        },
      ]);
    });
  });
});
