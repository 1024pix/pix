import sinon from 'sinon';

import { certificationCenterMembershipAdminController } from '../../../../../src/team/application/certification-center-membership/certification-center-membership.admin.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Team | Application | Controller | CertificationCenterMembershipAdminController', function () {
  describe('#findCertificationCenterMembershipsByCertificationCenter', function () {
    const certificationCenterId = 1;

    const request = {
      params: {
        certificationCenterId,
      },
    };
    let certificationCenterMembershipSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'findCertificationCenterMembershipsByCertificationCenter');
      certificationCenterMembershipSerializerStub = {
        serialize: sinon.stub(),
      };
    });

    it('should call usecase and serializer and return ok', async function () {
      // given
      usecases.findCertificationCenterMembershipsByCertificationCenter
        .withArgs({
          certificationCenterId,
        })
        .resolves({});
      certificationCenterMembershipSerializerStub.serialize.withArgs({}).returns('ok');

      // when
      const response =
        await certificationCenterMembershipAdminController.findCertificationCenterMembershipsByCertificationCenter(
          request,
          hFake,
          { certificationCenterMembershipSerializer: certificationCenterMembershipSerializerStub },
        );

      // then
      expect(response).to.equal('ok');
    });
  });

  describe('#createCertificationCenterMembershipByEmail', function () {
    const certificationCenterId = 1;
    const email = 'user@example.net';

    const request = {
      params: { certificationCenterId },
      payload: { email },
    };

    let certificationCenterMembershipSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'createCertificationCenterMembershipByEmail');
      certificationCenterMembershipSerializerStub = {
        serialize: sinon.stub().returns('ok'),
      };
      usecases.createCertificationCenterMembershipByEmail.resolves();
    });

    it('should call usecase and serializer and return 201 HTTP code', async function () {
      // when
      const response = await certificationCenterMembershipAdminController.createCertificationCenterMembershipByEmail(
        request,
        hFake,
        {
          certificationCenterMembershipSerializer: certificationCenterMembershipSerializerStub,
        },
      );

      // then
      expect(usecases.createCertificationCenterMembershipByEmail).calledWith({ certificationCenterId, email });
      expect(response.source).to.equal('ok');
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#updateRole', function () {
    it('should call usecase and serializer and return 201 HTTP code', async function () {
      // given
      const id = 1;

      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId: 1234 }),
        params: { id },
        payload: {},
      };

      const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership();
      const certificationCenterMembershipSerializerStub = {
        deserialize: sinon.stub().returns(certificationCenterMembership),
        serializeForAdmin: sinon.stub(),
      };

      sinon.stub(usecases, 'updateCertificationCenterMembership');

      usecases.updateCertificationCenterMembership.resolves();

      // when
      const response = await certificationCenterMembershipAdminController.updateRole(request, hFake, {
        certificationCenterMembershipSerializer: certificationCenterMembershipSerializerStub,
      });

      // then
      expect(usecases.updateCertificationCenterMembership).calledWith({
        certificationCenterMembershipId: 1,
        role: certificationCenterMembership.role,
        updatedByUserId: 1234,
      });

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#disableFromPixAdmin', function () {
    it('should call usecase and serializer and return 201 HTTP code', async function () {
      // given
      const id = 1;

      const request = {
        headers: generateAuthenticatedUserRequestHeaders({ userId: 1234 }),
        params: { id },
        payload: {},
      };

      sinon.stub(usecases, 'disableCertificationCenterMembershipFromPixAdmin').resolves();

      // when
      const response = await certificationCenterMembershipAdminController.disableFromPixAdmin(request, hFake);

      // then
      expect(usecases.disableCertificationCenterMembershipFromPixAdmin).calledWith({
        certificationCenterMembershipId: 1,
        updatedByUserId: 1234,
      });

      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#findCertificationCenterMembershipsByUser', function () {
    describe('#findCertificationCenterMembershipsByUser', function () {
      it("returns user's certification centers", async function () {
        // given
        const certificationCenterMemberships = Symbol("a list of user's certification center memberships");
        const certificationCenterMembershipsSerialized = Symbol(
          "a list of user's certification center memberships serialized",
        );

        const certificationCenterMembershipSerializer = { serializeForAdmin: sinon.stub() };
        certificationCenterMembershipSerializer.serializeForAdmin
          .withArgs(certificationCenterMemberships)
          .returns(certificationCenterMembershipsSerialized);

        sinon
          .stub(usecases, 'findCertificationCenterMembershipsByUser')
          .withArgs({ userId: 12345 })
          .resolves(certificationCenterMemberships);

        // when
        const request = {
          params: {
            id: 12345,
          },
        };
        const result = await certificationCenterMembershipAdminController.findCertificationCenterMembershipsByUser(
          request,
          hFake,
          {
            certificationCenterMembershipSerializer,
          },
        );

        // then
        expect(result.source).to.equal(certificationCenterMembershipsSerialized);
      });
    });
  });
});
