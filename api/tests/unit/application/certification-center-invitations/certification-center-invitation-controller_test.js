import { expect, sinon, hFake, domainBuilder } from '../../../test-helper';
import certificationCenterInvitationController from '../../../../lib/application/certification-center-invitations/certification-center-invitation-controller';
import usecases from '../../../../lib/domain/usecases';
import CertificationCenterInvitation from '../../../../lib/domain/models/CertificationCenterInvitation';
import certificationCenterInvitationSerializer from '../../../../lib/infrastructure/serializers/jsonapi/certification-center-invitation-serializer';

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
      const serializedResponse = Symbol('serializedCancelledCertificationCenterInvitation');

      sinon
        .stub(certificationCenterInvitationSerializer, 'serialize')
        .withArgs(cancelledCertificationCenterInvitation)
        .returns(serializedResponse);

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
