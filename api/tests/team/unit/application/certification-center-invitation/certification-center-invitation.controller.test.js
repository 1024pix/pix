import { certificationCenterInvitationController } from '../../../../../src/team/application/certification-center-invitation/certification-center-invitation.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Application | Controller | Certification-center-invitation', function () {
  describe('#acceptCertificationCenterInvitation', function () {
    it('accepts invitation with certificationCenterInvitationId, email and code', async function () {
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
        hFake,
      );

      // then
      expect(usecases.acceptCertificationCenterInvitation).to.have.been.calledWithExactly({
        certificationCenterInvitationId,
        code,
        email: notValidEmail.trim().toLowerCase(),
        localeFromCookie: undefined,
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
