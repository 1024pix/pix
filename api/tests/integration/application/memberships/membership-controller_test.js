const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Membership = require('../../../../lib/domain/models/Membership');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/memberships');
const { InvalidMembershipRoleError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Memberships | membership-controller', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'createMembership');
    sinon.stub(usecases, 'updateMembership');
    sinon.stub(usecases, 'disableMembership');
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganizationOrHasRolePixMaster');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('#create', () => {

    const payload = {
      data: {
        type: 'memberships',
        relationships: {
          'user': { data: { type: 'users', id: 1 } },
          'organization': { data: { type: 'organizations', id: 1 } },
        },
      },
    };

    context('Success cases', () => {

      it('should resolve a 201 HTTP response', async () => {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.createMembership.resolves(membership);

        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));

        // when
        const response = await httpTestServer.request('POST', '/api/memberships', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return a JSON API membership', async () => {
        // given
        const membership = domainBuilder.buildMembership();
        usecases.createMembership.resolves(membership);

        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response(true));

        // when
        const response = await httpTestServer.request('POST', '/api/memberships', payload);

        // then
        expect(response.result.data.type).to.equal('memberships');
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        it('should resolve a 403 HTTP response', () => {
          // given
          securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const promise = httpTestServer.request('POST', '/api/memberships', payload);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });
      });
    });
  });

  describe('#update', () => {

    const organizationRole = Membership.roles.ADMIN;

    const payload = {
      data: {
        type: 'memberships',
        attributes: {
          'organaization-role': organizationRole,
        },
      },
    };

    context('Success cases', () => {

      it('should return a 200 HTTP response', async () => {
        // given
        const membership = domainBuilder.buildMembership({
          organizationRole: Membership.roles.MEMBER,
        });
        usecases.updateMembership.resolves(membership);
        securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.callsFake((request, h) => h.response(true));

        // when
        const response = await httpTestServer.request('PATCH', '/api/memberships/1', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', () => {

      context('when user is not allowed to access resource', () => {

        it('should resolve a 403 HTTP response', async () => {
          // given
          securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const response = await httpTestServer.request('PATCH', '/api/memberships/1');

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when organization role is not valid', () => {

        it('should resolve a 400 HTTP response', async () => {
          // given
          securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.callsFake((request, h) => h.response(true));
          usecases.updateMembership.throws(new InvalidMembershipRoleError());

          // when
          const response = await httpTestServer.request('PATCH', '/api/memberships/1', payload);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('#disable', () => {

    context('Success cases', () => {

      it('should return a 200 HTTP response', async () => {
        // given
        const membershipId = domainBuilder.buildMembership().id;
        usecases.disableMembership.resolves();
        securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.callsFake((request, h) => h.response(true));

        // when
        const response = await httpTestServer.request('POST', `/api/memberships/${membershipId}/disable`);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', () => {

      context('when user is not admin of the organization nor has pix master role', () => {

        it('should resolve a 403 HTTP response', async () => {
          // given
          const membershipId = domainBuilder.buildMembership({ organizationRole: Membership.roles.MEMBER }).id;
          securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.callsFake((request, h) => {
            return Promise.resolve(h.response().code(403).takeover());
          });

          // when
          const response = await httpTestServer.request('POST', `/api/memberships/${membershipId}/disable`);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

});
