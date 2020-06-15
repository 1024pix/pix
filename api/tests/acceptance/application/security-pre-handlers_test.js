const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../test-helper');
const createServer = require('../../../server');
const Membership = require('../../../lib/domain/models/Membership');

describe('Acceptance | Application | SecurityPreHandlers', () => {

  const jsonApiError403 = {
    errors: [{
      code: 403,
      title: 'Forbidden access',
      detail: 'Missing or insufficient permissions.'
    }]
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
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
        disabledAt: new Date()
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
              email: 'member@example.net'
            }
          }
        }
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
        disabledAt: new Date()
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkUserIsAdminInScoOrganizationAndManagesStudents', () => {

    let userId;
    let organizationId;
    let options;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;

      options = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        method: 'POST',
      };

      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is not in sco managing students orga', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
      databaseBuilder.factory.buildMembership({
        userId, organizationId, organizationRole: Membership.roles.ADMIN,
      });

      options.url = `/api/organizations/${organizationId}/import-students`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is in sco managing students orga but not admin', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        userId, organizationId, organizationRole: Membership.roles.MEMBER,
      });

      options.url = `/api/organizations/${organizationId}/import-students`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is in sco managing students orga and admin, but membership is disabled', async () => {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        userId, organizationId, organizationRole: Membership.roles.ADMIN,
        disabledAt: new Date()
      });

      options.url = `/api/organizations/${organizationId}/import-students`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
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
