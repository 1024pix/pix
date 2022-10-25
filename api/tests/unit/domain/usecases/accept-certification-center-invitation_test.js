const { expect, sinon, domainBuilder } = require('../../../test-helper');
const acceptCertificationCenterInvitation = require('../../../../lib/domain/usecases/accept-certification-center-invitation');

describe('Unit | UseCase | accept-certification-center-invitation', function () {
  it('should return the user invitation', async function () {
    // given
    const certificationCenterInvitedUserRepository = {
      get: sinon.stub(),
    };
    const email = 'user@example.net';
    const certificationCenterId = domainBuilder.buildCertificationCenter().id;
    const certificationCenterInvitationId = domainBuilder.buildCertificationCenterInvitation({
      certificationCenterId,
    }).id;
    domainBuilder.buildUser({ email });

    // when
    await acceptCertificationCenterInvitation({
      certificationCenterInvitationId,
      email,
      certificationCenterInvitedUserRepository,
    });

    // then
    expect(certificationCenterInvitedUserRepository.get).to.have.been.calledWith({
      certificationCenterInvitationId,
      email,
    });
  });
});
