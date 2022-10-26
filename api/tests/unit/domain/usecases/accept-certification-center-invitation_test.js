const { expect, sinon, domainBuilder } = require('../../../test-helper');
const acceptCertificationCenterInvitation = require('../../../../lib/domain/usecases/accept-certification-center-invitation');
const CertificationCenterInvitedUser = require('../../../../lib/domain/models/CertificationCenterInvitedUser');
const CertificationCenterInvitation = require('../../../../lib/domain/models/CertificationCenterInvitation');

describe('Unit | UseCase | accept-certification-center-invitation', function () {
  it('should return the user invitation', async function () {
    // given
    const certificationCenterInvitedUserRepository = {
      get: sinon.stub(),
    };
    const code = 'SDFGH123';
    const email = 'user@example.net';
    const certificationCenterId = domainBuilder.buildCertificationCenter().id;
    const certificationCenterInvitation = domainBuilder.buildCertificationCenterInvitation({
      id: 1234,
      certificationCenterId,
    });
    const user = domainBuilder.buildUser({ email });

    const certificationCenterInvitedUser = new CertificationCenterInvitedUser({
      userId: user.id,
      invitation: { code, id: certificationCenterInvitation.id },
      status: CertificationCenterInvitation.StatusType.PENDING,
    });
    certificationCenterInvitedUserRepository.get.resolves(certificationCenterInvitedUser);

    // when
    await acceptCertificationCenterInvitation({
      certificationCenterInvitationId: certificationCenterInvitation.id,
      code,
      email,
      certificationCenterInvitedUserRepository,
    });

    // then
    expect(certificationCenterInvitedUserRepository.get).to.have.been.calledWith({
      certificationCenterInvitationId: 1234,
      email: 'user@example.net',
    });
  });
});
