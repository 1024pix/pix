import sinon from 'sinon';

import { findOrganizationLearnersWithParticipations } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-organization-learners-with-participations.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';

describe('Unit | UseCase | find-organization-learners-with-participations', function () {
  context('#findOrganizationLearnersWithParticipations', function () {
    it('should not call libOrganizationLearnerRepository if userIds does not have the expected format', async function () {
      // given
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
      const libOrganizationLearnerRepository = {
        findByUserId: sinon.stub(),
      };

      // when
      await findOrganizationLearnersWithParticipations({
        userIds: [null],
        libOrganizationLearnerRepository,
      });

      // then
      expect(libOrganizationLearnerRepository.findByUserId).to.not.have.been.called;
    });
  });
});
