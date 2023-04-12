const { expect, sinon, hFake, domainBuilder } = require('../../../test-helper');
const certificationCenterInvitationController = require('../../../../lib/application/certification-center-invitations/certification-center-invitation-controller');
const usecases = require('../../../../lib/domain/usecases/index.js');
const CertificationCenterInvitation = require('../../../../lib/domain/models/CertificationCenterInvitation');

describe('Unit | Application | Certification-center-Invitations | Certification-center-invitation-controller', function () {
  describe('#acceptCertificationCenterInvitation', function () {
    it('should accept invitation with certificationCenterInvitationId, email and code', async function () {
      // given
      const code = 'ABCDEFGH01';
      const notValidEmail = '   RANDOM@email.com   ';
      const certificationCenterInvitationId = '1234';
      const request = {
        params: { id: certificationCenterInvitationId },
        deserializedPayload: {
          code,
          email: notValidEmail,
        },
      };

      sinon.stub(usecases, 'acceptCertificationCenterInvitation').resolves();

      // when
      const response = await certificationCenterInvitationController.acceptCertificationCenterInvitation(
        request,
        hFake
      );

      // then
      expect(usecases.acceptCertificationCenterInvitation).to.have.been.calledWith({
        certificationCenterInvitationId,
        code,
        email: notValidEmail.trim().toLowerCase(),
        localeFromCookie: undefined,
      });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#cancelCertificationCenterInvitation', function () {
    it('should call the use case to cancel invitation with certificationCenterInvitationId', async function () {
      //given
      const certificationCenterInvitationId = 123;

      const cancelledCertificationCenterInvitation = domainBuilder.buildCertificationCenterInvitation({
        id: certificationCenterInvitationId,
        status: CertificationCenterInvitation.StatusType.CANCELLED,
      });

      sinon
        .stub(usecases, 'cancelCertificationCenterInvitation')
        .withArgs({
          certificationCenterInvitationId: cancelledCertificationCenterInvitation.id,
        })
        .resolves(cancelledCertificationCenterInvitation);

      // when
      const response = await certificationCenterInvitationController.cancelCertificationCenterInvitation(
        {
          auth: { credentials: { userId: 1 } },
          params: { certificationCenterInvitationId },
        },
        hFake
      );

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
