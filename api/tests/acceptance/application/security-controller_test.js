const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');
const Membership = require('../../../lib/domain/models/Membership');

describe('Acceptance | Interface | Controller | SecurityController', function() {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('#checkUserIsAuthenticated', () => {

    it('should disallow access resource with well formed JSON API error', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/organizations',
        payload: {}
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 401,
          title: 'Unauthorized access',
          detail: 'Missing or invalid access token in request auhorization headers.'
        }]
      };
      expect(response.statusCode).to.equal(401);
      expect(response.result).to.deep.equal(jsonApiError);
    });
  });

  describe('#checkUserHasRolePixMaster', () => {

    it('should return a well formed JSON API error when user is not authorized', async () => {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/cache',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });

  });

  describe('#checkRequestedUserIsAuthenticatedUser', () => {

    it('should return a well formed JSON API error when user in query params is not the same as authenticated', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/1/memberships',
        headers: { authorization: generateValidRequestAuthorizationHeader(2) },
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });

  });

  describe('#checkUserBelongsToScoOrganizationAndManagesStudents', () => {
    let userId;
    let organizationId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is in a not sco organization', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/students`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });

    it('should return a well formed JSON API error when user is in a sco orga that does not manage students', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/students`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });

  });

  describe('#checkUserIsAdminInOrganization', () => {

    it('should return a well formed JSON API error when user is not admin in orga', async () => {
      // given
      const notAdminUserId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        userId: notAdminUserId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/invitations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(notAdminUserId) },
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });

  });

  describe('#checkUserIsAdminInOrganizationOrHasRolePixMaster', () => {

    it('should return a well formed JSON API error when user is neither admin nor pix_master', async () => {
      // given
      const notAdminUserId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        userId: notAdminUserId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'POST',
        url: `/api/organizations/${organizationId}/invitations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(notAdminUserId) },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              email: 'truc@example.net'
            },
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });

  });

  describe('#checkUserIsAdminInScoOrganizationAndManagesStudents', () => {

    it('should return a well formed JSON API error when user is not in sco managing students orga', async () => {
      // given
      const notAdminUserId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
      databaseBuilder.factory.buildMembership({
        userId: notAdminUserId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'POST',
        url: `/api/organizations/${organizationId}/import-students`,
        headers: { authorization: generateValidRequestAuthorizationHeader(notAdminUserId) },
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });

    it('should return a well formed JSON API error when user is in sco managing students orga but not admin', async () => {
      // given
      const notAdminUserId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        userId: notAdminUserId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'POST',
        url: `/api/organizations/${organizationId}/import-students`,
        headers: { authorization: generateValidRequestAuthorizationHeader(notAdminUserId) },
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });

  });

  describe('#checkUserBelongsToOrganizationOrHasRolePixMaster', () => {
    let userId;
    let organizationId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is neither in the organization nor PIXMASTER', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/memberships`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 403,
          title: 'Forbidden access',
          detail: 'Missing or insufficient permissions.'
        }]
      };
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError);
    });
  });

});
