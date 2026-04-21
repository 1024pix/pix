import sinon from 'sinon';

import { certificationCenterInvitationAdminController } from '../../../../../src/team/application/certification-center-invitation/certification-center-invitation.admin.controller.js';
import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Team | Application | Controller | Admin | Certification Center Invitation', function () {
  describe('#cancelCertificationCenterInvitation', function () {
    it('calls the usecase to cancel invitation with certificationCenterInvitationId', async function () {
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
      const response = await certificationCenterInvitationAdminController.cancelCertificationCenterInvitation(
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

  describe('#sendInvitationForAdmin', function () {
    let certificationCenterInvitationSerializerStub;

    beforeEach(function () {
      certificationCenterInvitationSerializerStub = {
        deserializeForAdmin: sinon.stub(),
        serializeForAdmin: sinon.stub(),
      };

      sinon.stub(usecases, 'createOrUpdateCertificationCenterInvitationForAdmin');
    });

    it('should return 201 HTTP status code with data if there isn’t an already pending invitation', async function () {
      // given
      const email = 'some.user@example.net';
      const locale = 'fr-FR';
      const role = null;
      const certificationCenterId = 7;
      const payload = {
        data: {
          type: 'certification-center-invitations',
          attributes: {
            email,
            locale,
            role,
          },
        },
      };

      certificationCenterInvitationSerializerStub.deserializeForAdmin.withArgs(payload).resolves({
        email,
        locale,
      });
      usecases.createOrUpdateCertificationCenterInvitationForAdmin
        .withArgs({
          email,
          locale,
          role,
          certificationCenterId,
        })
        .resolves({
          certificationCenterInvitation: 'an invitation',
          isInvitationCreated: true,
        });
      const serializedData = Symbol();
      certificationCenterInvitationSerializerStub.serializeForAdmin.withArgs('an invitation').returns(serializedData);

      // when
      const response = await certificationCenterInvitationAdminController.sendInvitationForAdmin(
        {
          params: { certificationCenterId },
          payload,
        },
        hFake,
        {
          certificationCenterInvitationSerializer: certificationCenterInvitationSerializerStub,
        },
      );

      // then
      expect(response.source).to.equal(serializedData);
      expect(response.statusCode).to.equal(201);
    });

    it('should return 200 HTTP status code with data if there is already a pending existing invitation', async function () {
      // given
      const email = 'some.user@example.net';
      const locale = 'fr-fr';
      const role = 'ADMIN';

      certificationCenterInvitationSerializerStub.deserializeForAdmin.resolves({ email, locale });
      usecases.createOrUpdateCertificationCenterInvitationForAdmin.resolves({
        certificationCenterInvitation: 'an invitation',
        isInvitationCreated: false,
      });
      const serializedData = Symbol();
      certificationCenterInvitationSerializerStub.serializeForAdmin.returns(serializedData);

      // when
      const response = await certificationCenterInvitationAdminController.sendInvitationForAdmin(
        {
          params: { certificationCenterId: 7 },
          payload: {
            data: {
              type: 'certification-center-invitations',
              attributes: {
                email,
                locale,
                role,
              },
            },
          },
        },
        hFake,
        {
          certificationCenterInvitationSerializer: certificationCenterInvitationSerializerStub,
        },
      );

      // then
      expect(response.source).to.equal(serializedData);
      expect(response.statusCode).to.equal(200);
    });
  });
});
