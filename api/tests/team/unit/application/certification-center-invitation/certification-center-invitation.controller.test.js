import { requestResponseUtils } from '../../../../../src/shared/infrastructure/utils/request-response-utils.js';
import { certificationCenterInvitationController } from '../../../../../src/team/application/certification-center-invitation/certification-center-invitation.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { certificationCenterInvitationSerializer } from '../../../../../src/team/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

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
        locale: undefined,
      });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#resendCertificationCenterInvitation', function () {
    it('calls the resend certification center invitation usecase and returns an certification center invitation', async function () {
      // given
      const certificationCenterInvitationId = 123;
      const certificationCenterInvitation = domainBuilder.buildCertificationCenterInvitation({
        id: certificationCenterInvitationId,
      });
      const locale = 'nl-BE';
      const serializerResult = {
        type: 'certification-center-invitation',
        id: certificationCenterInvitation.id,
        attributes: {
          email: certificationCenterInvitation.email,
          role: certificationCenterInvitation.role,
          'updated-at': certificationCenterInvitation.updatedAt,
        },
      };

      sinon.stub(requestResponseUtils, 'extractLocaleFromRequest').returns(locale);

      sinon.stub(usecases, 'resendCertificationCenterInvitation');
      usecases.resendCertificationCenterInvitation
        .withArgs({
          certificationCenterInvitationId,
          locale,
        })
        .resolves(certificationCenterInvitation);

      sinon.stub(certificationCenterInvitationSerializer, 'serializeForAdmin');
      certificationCenterInvitationSerializer.serializeForAdmin
        .withArgs(certificationCenterInvitation)
        .returns(serializerResult);

      // when
      const response = await certificationCenterInvitationController.resendCertificationCenterInvitation(
        {
          auth: { credentials: { userId: 1 } },
          params: { certificationCenterInvitationId },
        },
        hFake,
      );

      // then
      expect(requestResponseUtils.extractLocaleFromRequest).to.have.been.called;
      expect(usecases.resendCertificationCenterInvitation).to.have.been.called;
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal(serializerResult);
    });
  });
});
