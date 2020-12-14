const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');
const Membership = require('../../../lib/domain/models/Membership');
const securityPreHandlers = require('../../../lib/application/security-pre-handlers');

describe('Acceptance | Application | SecurityPreHandlers', () => {

  const jsonApiError403 = {
    errors: [{
      code: 403,
      title: 'Forbidden access',
      detail: 'Missing or insufficient permissions.',
    }],
  };

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
        payload: {},
      };

      // when
      const response = await server.inject(options);

      // then
      const jsonApiError = {
        errors: [{
          code: 401,
          title: 'Unauthorized access',
          detail: 'Missing or invalid access token in request auhorization headers.',
        }],
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
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
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
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

  });

  describe('#checkUserBelongsToScoOrganizationAndManagesStudents', () => {

    let userId;
    let organizationId;
    let options;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      options = {
        method: 'GET',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is in a not sco organization', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      options.url = `/api/organizations/${organizationId}/students`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is in a sco orga that does not manage students', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      options.url = `/api/organizations/${organizationId}/students`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when membership is disabled', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });

      options.url = `/api/organizations/${organizationId}/students`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

  });

  describe('#checkUserIsAdminInOrganization', () => {

    let userId;
    let organizationId;
    let options;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      options = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        method: 'GET',
        url: `/api/organizations/${organizationId}/invitations`,
      };

      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is not admin in the organization', async () => {
      // given
      databaseBuilder.factory.buildMembership({
        userId, organizationId, organizationRole: Membership.roles.MEMBER,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is admin in the organization, but membership is disabled', async () => {
      // given
      databaseBuilder.factory.buildMembership({
        userId, organizationId, organizationRole: Membership.roles.ADMIN,
        disabledAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkUserIsAdminInOrganizationOrHasRolePixMaster', () => {

    let userId;
    let organizationId;
    let options;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      options = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        method: 'POST',
        url: `/api/organizations/${organizationId}/invitations`,
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              email: 'member@example.net',
            },
          },
        },
      };

      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is neither admin nor pix_master', async () => {
      // given
      databaseBuilder.factory.buildMembership({
        userId, organizationId, organizationRole: Membership.roles.MEMBER,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is admin, but membership is disabled', async () => {
      // given
      databaseBuilder.factory.buildMembership({
        userId, organizationId, organizationRole: Membership.roles.ADMIN,
        disabledAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkUserIsAdminInSCOOrganizationAndManagesStudents', () => {

    beforeEach(async () => {
      server.route({
        method: 'GET',
        path: '/test_route/{id}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [{
            method: securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
          }],
        },
      });
    });

    it('respond 403 when the user is not member of the SCO organization managing students', async () => {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('respond 200 when the user is admin in the orga and it is SCO orga managing students', async () => {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserIsAdminInSUPOrganizationAndManagesStudents', () => {

    beforeEach(async () => {
      server.route({
        method: 'GET',
        path: '/test_route/{id}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [{
            method: securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents,
          }],
        },
      });
    });

    it('respond 403 when the user is not member of the SUP organization managing students', async () => {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true }).id;

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('respond 200 when the user is admin in the organization and which id not a SUP organization managing students', async () => {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserBelongsToOrganizationOrHasRolePixMaster', () => {

    let userId;
    let organizationId;
    let options;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;

      options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/memberships`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is neither in the organization nor PIXMASTER', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is in the orga, but membership is disabled', async () => {
      // given
      databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });
});
