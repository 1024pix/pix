const { expect, sinon, hFake } = require('../../../test-helper');
const certificationCenterInvitationController = require('../../../../lib/application/certification-center-invitations/certification-center-invitation-controller');
const usecases = require('../../../../lib/domain/usecases');

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
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
