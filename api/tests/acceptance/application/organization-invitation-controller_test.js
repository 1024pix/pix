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
          organizationRole: Membership.roles.ADMIN,
        });

        const userToInviteEmail = databaseBuilder.factory.buildUser().email;
        const code = 'ABCDEFGH01';

        const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.PENDING,
          code: code
        }).id;

        const status = OrganizationInvitation.StatusType.ACCEPTED;

        options = {
          method: 'POST',
          url: `/api/organization-invitations/${organizationInvitationId}/response`,
          payload: {
            data: {
              type: 'organization-invitations',
              attributes: { code, status, email: userToInviteEmail },
            }
          }
        };

        await databaseBuilder.commit();
      });

      afterEach(() => {
        return knex('memberships').delete();
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
                code: 'notExistCode',
                status: OrganizationInvitation.StatusType.ACCEPTED,
              }
            }
          }
        };

        await databaseBuilder.commit();
      });

      it('should respond with a 404 if organization-invitation does not exist with id and code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 412 if organization-invitation is already accepted', async () => {
        // given
        const { id: organizationInvitationId, code } = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.ACCEPTED
        });

        options.url = `/api/organization-invitations/${organizationInvitationId}/response`;
        options.payload.data.attributes.code = code;

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });

      it('should respond with a 404 if given email is not linked to an existing user', async () => {
        // given
        const { id: organizationInvitationId, code } = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.PENDING
        });

        options.url = `/api/organization-invitations/${organizationInvitationId}/response`;
        options.payload.data.attributes.code = code;
        options.payload.data.attributes.code = 'random@email.com';

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 412 if membership already exist with userId and OrganizationId', async () => {
        // given
        const { id: userId, email } = databaseBuilder.factory.buildUser();

        databaseBuilder.factory.buildMembership({ userId, organizationId });

        const { id: organizationInvitationId, code } = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.PENDING
        });

        options.url = `/api/organization-invitations/${organizationInvitationId}/response`;
        options.payload.data.attributes.code = code;
        options.payload.data.attributes.email = email;

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });
  });

  describe('GET /api/organization-invitations/{id}', () => {

    let organizationId;
    let options;

    context('Success cases', () => {

      beforeEach(async () => {
        organizationId = databaseBuilder.factory.buildOrganization().id;

        const code = 'ABCDEFGH01';

        const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.PENDING,
          code
        }).id;

        options = {
          method: 'GET',
          url: `/api/organization-invitations/${organizationInvitationId}?code=${code}`,
        };

        await databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', () => {

      let organizationInvitationId;

      beforeEach(async () => {
        const code = 'ABCDEFGH01';

        organizationId = databaseBuilder.factory.buildOrganization().id;
        organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          code
        }).id;

        options = {
          method: 'GET',
          url: `/api/organization-invitations/${organizationInvitationId}?code=${code}`,
        };

        await databaseBuilder.commit();
      });

      it('should respond with a 400 - missing parameters if organization-invitation is requested without code', async () => {
        // given
        options.url = `/api/organization-invitations/${organizationInvitationId}`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should respond with a 404 if organization-invitation is not found with given id and code', async () => {
        // given
        options.url = `/api/organization-invitations/${organizationInvitationId}?code=999`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 412 if organization-invitation is already accepted', async () => {
        // given
        const code = 'ABCDEFGH01';
        organizationId = databaseBuilder.factory.buildOrganization().id;
        organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          code,
          status: 'accepted'
        }).id;
        await databaseBuilder.commit();

        options.url = `/api/organization-invitations/${organizationInvitationId}?code=${code}`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });
  });

});
