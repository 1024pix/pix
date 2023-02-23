const { expect, sinon } = require('../../../test-helper');
const { disableCertificationCenterMembership } = require('../../../../lib/domain/usecases/index.js');
const certificationCenterMembershipRepository = require('../../../../lib/infrastructure/repositories/certification-center-membership-repository');

describe('Unit | UseCase | disable-certification-center-membership', function () {
  it('should disable certification center membership', async function () {
    // given
    const certificationCenterMembershipId = 100;
    sinon.stub(certificationCenterMembershipRepository, 'disableById');

    // when
    await disableCertificationCenterMembership({
      certificationCenterMembershipId,
      certificationCenterMembershipRepository,
    });

    // then
    expect(certificationCenterMembershipRepository.disableById).to.have.been.calledWithExactly({
      certificationCenterMembershipId,
    });
  });
});
