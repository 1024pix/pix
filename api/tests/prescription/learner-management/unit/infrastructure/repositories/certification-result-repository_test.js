import { expect } from 'chai';
import sinon from 'sinon';

import { detachOrganizationLearners } from '../../../../../../src/prescription/learner-management/infrastructure/repositories/certification-result-repository.js';

describe('Unit | Prescription | Learner Management | Infrastructure | Repositories | Certification Result', function () {
  describe('#detachOrganizationLearners', function () {
    it('asks the certification results bounded context to detach the organization learners', async function () {
      // given
      const organizationLearnerIds = [12, 34];
      const certificationResultApi = { detachOrganizationLearners: sinon.stub().resolves() };

      // when
      await detachOrganizationLearners({ organizationLearnerIds, certificationResultApi });

      // then
      expect(certificationResultApi.detachOrganizationLearners).to.have.been.calledOnceWithExactly({
        organizationLearnerIds,
      });
    });
  });
});
