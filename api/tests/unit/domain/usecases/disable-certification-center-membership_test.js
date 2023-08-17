import { disableCertificationCenterMembership } from '../../../../lib/domain/usecases/disable-certification-center-membership.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | disable-certification-center-membership', function () {
  let certificationCenterMembershipRepository;
  beforeEach(function () {
    certificationCenterMembershipRepository = {
      disableById: sinon.stub(),
    };
  });

  it('should disable certification center membership', async function () {
    // given
    const certificationCenterMembershipId = 100;

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
