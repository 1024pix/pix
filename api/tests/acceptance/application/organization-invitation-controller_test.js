const { expect, knex, databaseBuilder } = require('../../test-helper');

const Membership = require('../../../lib/domain/models/Membership');
const OrganizationInvitation = require('../../../lib/domain/models/OrganizationInvitation');

const createServer = require('../../../server');

describe('Acceptance | Application | organization-invitation-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/organization-invitations/{id}/response', () => {

    let organizationId;
    let options;

    context('Success cases', () => {

      beforeEach(async () => {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        const adminOrganizationUserId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildMembership({
          userId: adminOrganizationUserId,
          organizationId,
          organizationRole: Membership.roles.OWNER,
        });

        const userToInviteEmail = databaseBuilder.factory.buildUser().email;
        const temporaryKey = 'temporaryKey';

        const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          email: userToInviteEmail,
          status: OrganizationInvitation.StatusType.PENDING,
          temporaryKey
        }).id;

        const status = OrganizationInvitation.StatusType.ACCEPTED;

        options = {
          method: 'POST',
          url: `/api/organization-invitations/${organizationInvitationId}/response`,
          payload: {
            data: {
              type: 'organization-invitations',
              attributes: {
                'temporary-key': temporaryKey,
                status
              },
            }
          }
        };

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await knex('memberships').delete();
        await databaseBuilder.clean();
      });

      it('should return 204 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', () => {

      let organizationInvitationId;

      beforeEach(async () => {

        organizationId = databaseBuilder.factory.buildOrganization().id;
        organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId
        }).id;

        options = {
          method: 'POST',
          url: `/api/organization-invitations/${organizationInvitationId}/response`,
          payload: {
            data: {
              type: 'organization-invitations',
              attributes: {
                'temporary-key': 'notExistTemporaryKey',
                status: OrganizationInvitation.StatusType.ACCEPTED,
              }
            }
          }
        };

        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should respond with a 404 if organization-invitation does not exist with id and temporaryKey', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 421 if organization-invitation is already accepted', async () => {
        // given
        const { id: organizationInvitationId, temporaryKey } = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.ACCEPTED
        });

        options.url = `/api/organization-invitations/${organizationInvitationId}/response`;
        options.payload.data.attributes['temporary-key'] = temporaryKey;

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(421);
      });

      it('should respond with a 404 if given email is not linked to an existing user', async () => {
        // given
        const { id: organizationInvitationId, temporaryKey } = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          email: 'fakeEmail@organization.org',
          status: OrganizationInvitation.StatusType.PENDING
        });

        options.url = `/api/organization-invitations/${organizationInvitationId}/response`;
        options.payload.data.attributes['temporary-key'] = temporaryKey;

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 421 if membership already exist with userId and OrganizationId', async () => {
        // given
        const { id: userId, email } = databaseBuilder.factory.buildUser();

        databaseBuilder.factory.buildMembership({ userId, organizationId });

        const { id: organizationInvitationId, temporaryKey } = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          email,
          status: OrganizationInvitation.StatusType.PENDING
        });

        options.url = `/api/organization-invitations/${organizationInvitationId}/response`;
        options.payload.data.attributes['temporary-key'] = temporaryKey;

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(421);
      });
    });
  });

});
