import sinon from 'sinon';

import { certificationCenterInvitationController } from '../../../../../src/team/application/certification-center-invitation/certification-center-invitation.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { certificationCenterInvitationSerializer } from '../../../../../src/team/infrastructure/serializers/jsonapi/certification-center-invitation-serializer.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Team | Application | Controller | Certification-center-invitation', function () {
  describe('#acceptCertificationCenterInvitation', function () {
    it('accepts invitation with certificationCenterInvitationId, email and code', async function () {
      // given
      const code = 'ABCDEFGH01';
      const notValidEmail = '   RANDOM@email.com   ';
      const certificationCenterInvitationId = '1234';
      const locale = 'fr-FR';
      const request = {
        params: { id: certificationCenterInvitationId },
        deserializedPayload: {
          code,
          email: notValidEmail,
        },
        state: { locale },
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
        locale,
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

      const serializerResult = {
        type: 'certification-center-invitation',
        id: certificationCenterInvitation.id,
        attributes: {
          email: certificationCenterInvitation.email,
          role: certificationCenterInvitation.role,
          'updated-at': certificationCenterInvitation.updatedAt,
        },
      };

      sinon.stub(usecases, 'resendCertificationCenterInvitation');
      usecases.resendCertificationCenterInvitation
        .withArgs({ certificationCenterInvitationId })
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
      expect(usecases.resendCertificationCenterInvitation).to.have.been.called;
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal(serializerResult);
    });
  });
});
