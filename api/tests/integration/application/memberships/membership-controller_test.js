const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Membership = require('../../../../lib/domain/models/Membership');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/memberships');
const { InvalidMembershipOrganizationRoleError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Memberships | membership-controller', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(usecases, 'createMembership');
    sinon.stub(usecases, 'updateMembership');
    sinon.stub(usecases, 'disableMembership');
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganizationOrHasRolePixMaster');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
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

    context('Success cases', () => {

      it('should return a 200 HTTP response', async () => {
        // given
        const membership = new Membership({
          id: 123,
          organizationRole: Membership.roles.ADMIN,
          updatedByUserId: null,
        });
        const updatedMembership = domainBuilder.buildMembership({
          organizationRole: Membership.roles.MEMBER,
        });
        usecases.updateMembership
          .withArgs({ membership })
          .resolves(updatedMembership);
        securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.callsFake((request, h) => h.response(true));

        // when
        const payload = {
          data: {
            type: 'memberships',
            id: 123,
            attributes: {
              'organization-role': Membership.roles.ADMIN,
            },
            relationships: {
              organization: {
                data: {
                  id: '1',
                  type: 'organizations',
                },
              },
            },
          },
        };
        const response = await httpTestServer.request('PATCH', `/api/memberships/${membership.id}`, payload);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', () => {

      context('when request is not valid', () => {

        it('should resolve a 400 HTTP response', async () => {
          // given
          securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster.callsFake((request, h) => h.response(true));
          const idGivenInRequestParams = 1;
          const idGivenInPayload = 44;

          const membership = new Membership({
            id: idGivenInPayload,
            organizationRole: Membership.roles.ADMIN,
            updatedByUserId: null,
          });
          const updatedMembership = domainBuilder.buildMembership({
            organizationRole: Membership.roles.ADMIN,
          });
          usecases.updateMembership
            .withArgs({ membership })
            .resolves(updatedMembership);

          // when
          const payload = {
            data: {
              type: 'memberships',
              id: idGivenInPayload,
              attributes: {
                'organization-role': Membership.roles.ADMIN,
              },
              relationships: {
                organization: {
                  data: {
                    id: '1',
                    type: 'organizations',
                  },
                },
              },
            },
          };
          const response = await httpTestServer.request('PATCH', `/api/memberships/${idGivenInRequestParams}`, payload);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

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
          usecases.updateMembership.throws(new InvalidMembershipOrganizationRoleError());

          // when
          const payload = {
            data: {
              type: 'memberships',
              attributes: {
                'organization-role': Membership.roles.ADMIN,
              },
              relationships: {
                organization: {
                  data: {
                    id: '1',
                    type: 'organizations',
                  },
                },
              },
            },
          };
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
