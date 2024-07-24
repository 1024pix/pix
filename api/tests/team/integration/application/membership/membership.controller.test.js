import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Memberships | membership-controller', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'createMembership');
    sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember');
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(teamRoutes);
  });

  describe('#create', function () {
    const payload = {
      data: {
        type: 'memberships',
        relationships: {
          user: { data: { type: 'users', id: 1 } },
          organization: { data: { type: 'organizations', id: 1 } },
        },
      },
    };

    context('Success cases', function () {
      context('when a certification center membership is created', function () {
        it('should resolve a 201 HTTP response', async function () {
          // given
          const membership = domainBuilder.buildMembership();
          const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership();

          usecases.createMembership.resolves(membership);
          usecases.createCertificationCenterMembershipForScoOrganizationAdminMember
            .withArgs({ membership })
            .resolves(certificationCenterMembership);

          securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/memberships', payload);

          // then
          expect(response.statusCode).to.equal(201);
        });
      });

      context('when no certification center membership is created', function () {
        it('should resolve a 201 HTTP response', async function () {
          // given
          const membership = domainBuilder.buildMembership();

          usecases.createMembership.resolves(membership);
          usecases.createCertificationCenterMembershipForScoOrganizationAdminMember
            .withArgs({ membership })
            .resolves(undefined);

          securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);

          // when
          const response = await httpTestServer.request('POST', '/api/admin/memberships', payload);

          // then
          expect(response.statusCode).to.equal(201);
        });
      });

      it('should return a JSON API organization membership', async function () {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.createMembership.resolves(membership);

        securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/memberships', payload);

        // then
        expect(response.result.data.type).to.equal('organization-memberships');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());

          // when
          const response = await httpTestServer.request('POST', '/api/admin/memberships', payload);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
