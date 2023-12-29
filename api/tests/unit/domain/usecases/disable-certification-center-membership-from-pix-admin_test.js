import { expect, sinon } from '../../../test-helper.js';
import { disableCertificationCenterMembershipFromPixAdmin } from '../../../../lib/domain/usecases/disable-certification-center-membership-from-pix-admin.js';

describe('Unit | UseCase | disable-certification-center-membership-from-pix-admin', function () {
  let certificationCenterMembershipRepository;
  beforeEach(function () {
    certificationCenterMembershipRepository = {
      disableById: sinon.stub(),
    };
  });

  it('should disable certification center membership', async function () {
    // given
    const certificationCenterMembershipId = 100;
    const updatedByUserId = 10;

    // when
    await disableCertificationCenterMembershipFromPixAdmin({
      certificationCenterMembershipId,
      updatedByUserId,
      certificationCenterMembershipRepository,
    });

    // then
    expect(certificationCenterMembershipRepository.disableById).to.have.been.calledWithExactly({
      certificationCenterMembershipId,
      updatedByUserId,
    });
  });
});
