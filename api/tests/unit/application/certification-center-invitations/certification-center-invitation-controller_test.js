import { expect, sinon, hFake, domainBuilder } from '../../../test-helper.js';
import { certificationCenterInvitationController } from '../../../../lib/application/certification-center-invitations/certification-center-invitation-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { CertificationCenterInvitation } from '../../../../lib/domain/models/CertificationCenterInvitation.js';
import { certificationCenterInvitationSerializer } from '../../../../lib/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';
import { requestResponseUtils } from '../../../../lib/infrastructure/utils/request-response-utils.js';

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
        hFake,
      );

      // then
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
