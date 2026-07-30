import { expect } from 'chai';
import sinon from 'sinon';

import { securityPreHandlers } from '../../../../../src/certification/shared/application/security-pre-handlers.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { preventStubsToBeCalledUnexpectedly } from '../../../../tooling/test-utils/error.js';

describe('Certification | Shared | Unit | Application | SecurityPreHandlers', function () {
  let userMembershipsRepository;

  beforeEach(function () {
    userMembershipsRepository = {
      findByUserId: sinon.stub(),
    };

    preventStubsToBeCalledUnexpectedly([userMembershipsRepository.findByUserId]);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#checkUserIsMemberOfCertificationCenter', function () {
    let dependencies;

    beforeEach(function () {
      dependencies = { userMembershipsRepository };
    });

    context('when credentials are not in request data', function () {
      it('should forbid resource access', async function () {
        const request = { auth: { credentials: { foo: 'bar' } } };

        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake, dependencies);

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    context('when credentials are invalid', function () {
      it('should forbid resource access', async function () {
        const request = { auth: { credentials: { userId: 'bar' } } };

        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake, dependencies);

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    context('when certificationCenterId param is invalid', function () {
      it('should forbid resource access', async function () {
        const request = { auth: { credentials: { userId: '123' } }, params: { certificationCenterId: 'foo' } };

        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake, dependencies);

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    context('when user is not a member of the certification center', function () {
      it('should forbid resource access', async function () {
        const request = { auth: { credentials: { userId: 123 } }, params: { certificationCenterId: 456 } };
        const userMemberships = domainBuilder.certification.shared
          .userMembershipsBuilder()
          .addMembership({ certificationCenterId: 789 })
          .withParameters({ userId: 123 })
          .build();
        userMembershipsRepository.findByUserId.withArgs({ userId: 123 }).resolves(userMemberships);

        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake, dependencies);

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    context('when user is a member of the certification center', function () {
      it('should authorize access to the resource', async function () {
        const request = { auth: { credentials: { userId: 123 } }, params: { certificationCenterId: 456 } };
        const userMemberships = domainBuilder.certification.shared
          .userMembershipsBuilder()
          .addMembership({ certificationCenterId: 456 })
          .withParameters({ userId: 123 })
          .build();
        userMembershipsRepository.findByUserId.withArgs({ userId: 123 }).resolves(userMemberships);

        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake, dependencies);

        expect(response.source).to.be.true;
      });
    });
  });

  describe('#checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId', function () {
    let dependencies;

    beforeEach(function () {
      dependencies = { userMembershipsRepository };
    });

    context('when credentials are not in request data', function () {
      it('should forbid resource access', async function () {
        const request = { auth: { credentials: { foo: 'bar' } } };

        const response =
          await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId(
            request,
            hFake,
            dependencies,
          );

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    context('when credentials are invalid', function () {
      it('should forbid resource access', async function () {
        const request = { auth: { credentials: { userId: 'bar' } } };

        const response =
          await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId(
            request,
            hFake,
            dependencies,
          );

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    context('when certificationCenterMembershipId param is invalid', function () {
      it('should forbid resource access', async function () {
        const request = {
          auth: { credentials: { userId: '123' } },
          params: { certificationCenterMembershipId: 'foo' },
        };

        const response =
          await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId(
            request,
            hFake,
            dependencies,
          );

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    context('when user is not an admin in peer certification center', function () {
      it('should forbid resource access', async function () {
        const request = { auth: { credentials: { userId: 123 } }, params: { certificationCenterMembershipId: 900 } };
        const userMemberships = domainBuilder.certification.shared
          .userMembershipsBuilder()
          .addMembership({ certificationCenterId: 789, peerMembershipIds: [101, 102] })
          .withParameters({ userId: 123 })
          .build();
        userMembershipsRepository.findByUserId.withArgs({ userId: 123 }).resolves(userMemberships);

        const response =
          await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId(
            request,
            hFake,
            dependencies,
          );

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    context('when user is an admin in peer certification center', function () {
      it('should authorize access to the resource', async function () {
        const request = { auth: { credentials: { userId: 123 } }, params: { certificationCenterMembershipId: 102 } };
        const userMemberships = domainBuilder.certification.shared
          .userMembershipsBuilder()
          .addMembership({ certificationCenterId: 789, isAdmin: true, peerMembershipIds: [101, 102] })
          .withParameters({ userId: 123 })
          .build();
        userMembershipsRepository.findByUserId.withArgs({ userId: 123 }).resolves(userMemberships);

        const response =
          await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId(
            request,
            hFake,
            dependencies,
          );

        expect(response.source).to.be.true;
      });
    });
  });
});
