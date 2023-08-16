import { expect, sinon } from '../../../../test-helper.js';
import { ScheduleComputeOrganizationLearnersCertificabilityJobHandler } from '../../../../../lib/infrastructure/jobs/organization-learner/ScheduleComputeOrganizationLearnersCertificabilityJobHandler.js';

describe('Unit | Infrastructure | Jobs | scheduleComputeOrganizationLearnersCertificabilityJobHandler', function () {
  context('#handle', function () {
    it('should schedule multiple ComputeCertificabilityJob', async function () {
      // given
      const pgBoss = {
        insert: sinon.stub(),
      };
      const organizationLearnerRepository = {
        findByOrganizationsWhichNeedToComputeCertificability: sinon.stub(),
      };
      organizationLearnerRepository.findByOrganizationsWhichNeedToComputeCertificability.resolves([1, 2]);
      const scheduleComputeOrganizationLearnersCertificabilityJobHandler =
        new ScheduleComputeOrganizationLearnersCertificabilityJobHandler({
          pgBoss,
          organizationLearnerRepository,
        });

      // when
      await scheduleComputeOrganizationLearnersCertificabilityJobHandler.handle();

      // then
      expect(pgBoss.insert.getCall(0).args[0]).to.be.deep.equal([
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 1 },
          retryLimit: 0,
          retryDelay: 30,
          on_complete: true,
        },
        {
          name: 'ComputeCertificabilityJob',
          data: { organizationLearnerId: 2 },
          retryLimit: 0,
          retryDelay: 30,
          on_complete: true,
        },
      ]);
    });
  });
});
