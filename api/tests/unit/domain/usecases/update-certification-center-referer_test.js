const { expect, sinon } = require('../../../test-helper');
const updateCertificationCenterReferer = require('../../../../lib/domain/usecases/update-certification-center-referer');

describe('Unit | UseCase | update-certification-center-referer', function () {
  it('should update the certification center membership', async function () {
    // given
    const certificationCenterMembershipRepository = {
      updateRefererStatusByUserIdAndCertificationCenterId: sinon.stub(),
    };

    // when
    await updateCertificationCenterReferer({
      userId: 1234,
      certificationCenterId: 456,
      isReferer: true,
      certificationCenterMembershipRepository,
    });

    // then
    expect(
      certificationCenterMembershipRepository.updateRefererStatusByUserIdAndCertificationCenterId
    ).to.have.been.calledWithExactly({
      userId: 1234,
      certificationCenterId: 456,
      isReferer: true,
    });
  });
});
