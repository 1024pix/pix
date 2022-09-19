const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const createServer = require('../../../../server');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

describe('Acceptance | Route | admin-members', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/admin-members/me', function () {
    it('should return the current user admin member', async function () {
      // given
      databaseBuilder.factory.buildUser({
        id: 123,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'the-slayer@sunnydale.com',
      });
      databaseBuilder.factory.buildPixAdminRole({
        id: 10,
        userId: 123,
        role: ROLES.CERTIF,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/admin/admin-members/me',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(123),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'admin-members',
        id: '10',
        attributes: {
          'first-name': 'Buffy',
          'last-name': 'Summers',
          email: 'the-slayer@sunnydale.com',
          role: 'CERTIF',
          'user-id': 123,
          'is-super-admin': false,
          'is-certif': true,
          'is-metier': false,
          'is-support': false,
        },
      });
    });
  });

  describe('GET /api/admin/admin-members', function () {
    it('should return the admin members', async function () {
      // given
      databaseBuilder.factory.buildUser({
        id: 123,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'the-slayer@sunnydale.com',
      });
      databaseBuilder.factory.buildPixAdminRole({
        id: 10,
        userId: 123,
        role: ROLES.SUPER_ADMIN,
      });
      databaseBuilder.factory.buildUser({
        id: 456,
        firstName: 'Rupert',
        lastName: 'Giles',
        email: 'the-watcher@london.com',
      });
      databaseBuilder.factory.buildPixAdminRole({
        id: 20,
        userId: 456,
        role: ROLES.SUPPORT,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/admin/admin-members',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(123),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'admin-members',
          id: '10',
          attributes: {
            'first-name': 'Buffy',
            'last-name': 'Summers',
            email: 'the-slayer@sunnydale.com',
            role: 'SUPER_ADMIN',
            'user-id': 123,
            'is-super-admin': true,
            'is-certif': false,
            'is-metier': false,
            'is-support': false,
          },
        },
        {
          type: 'admin-members',
          id: '20',
          attributes: {
            'first-name': 'Rupert',
            'last-name': 'Giles',
            email: 'the-watcher@london.com',
            role: 'SUPPORT',
            'user-id': 456,
            'is-super-admin': false,
            'is-certif': false,
            'is-metier': false,
            'is-support': true,
          },
        },
      ]);
    });
  });

  describe('PATCH /api/admin/admin-members/{id}', function () {
    it('should update admin member role and return the updated admin member', async function () {
      // given
      databaseBuilder.factory.buildUser.withRole({
        id: 66,
        role: ROLES.SUPER_ADMIN,
      });
      databaseBuilder.factory.buildUser({
        id: 123,
      });
      databaseBuilder.factory.buildPixAdminRole({
        id: 10,
        userId: 123,
        role: ROLES.CERTIF,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'PATCH',
        url: '/api/admin/admin-members/10',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(66),
        },
        payload: {
          data: {
            attributes: {
              role: 'SUPPORT',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const { role } = await knex('pix-admin-roles').select('role').where({ id: 10 }).first();
      expect(response.statusCode).to.equal(200);
      expect(role).to.equal('SUPPORT');
      expect(response.result.data).to.deep.equal({
        type: 'admin-members',
        id: '10',
        attributes: {
          'first-name': undefined,
          'last-name': undefined,
          email: undefined,
          role: 'SUPPORT',
          'user-id': 123,
          'is-super-admin': false,
          'is-certif': false,
          'is-metier': false,
          'is-support': true,
        },
      });
    });
  });

  describe('PUT /api/admin/admin-members/{id}/deactivate', function () {
    it('should deactivate the admin member', async function () {
      // given
      databaseBuilder.factory.buildUser.withRole({
        id: 66,
        role: ROLES.SUPER_ADMIN,
      });
      databaseBuilder.factory.buildUser({
        id: 123,
      });
      databaseBuilder.factory.buildPixAdminRole({
        id: 10,
        userId: 123,
        role: ROLES.CERTIF,
        disabledAt: null,
      });
      await databaseBuilder.commit();
      const options = {
        method: 'PUT',
        url: '/api/admin/admin-members/10/deactivate',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(66),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const { disabledAt } = await knex('pix-admin-roles').select('disabledAt').where({ id: 10 }).first();
      expect(response.statusCode).to.equal(204);
      expect(disabledAt).to.be.not.null;
    });
  });

  describe('POST /api/admin/admin-members', function () {
    it('should create the admin member', async function () {
      // given
      databaseBuilder.factory.buildUser.withRole({
        id: 66,
        role: ROLES.SUPER_ADMIN,
      });
      databaseBuilder.factory.buildUser({
        id: 123,
        firstName: 'Buffy',
        lastName: 'Summers',
        email: 'the-slayer@sunnydale.com',
      });
      await databaseBuilder.commit();
      const options = {
        method: 'POST',
        url: '/api/admin/admin-members',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(66),
        },
        payload: {
          data: {
            attributes: {
              email: 'the-slayer@sunnydale.com',
              role: 'CERTIF',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const { id } = await knex('pix-admin-roles').select('id').where({ userId: 123 }).first();
      expect(response.statusCode).to.equal(201);
      expect(response.result.data).to.deep.equal({
        type: 'admin-members',
        id: id.toString(),
        attributes: {
          'first-name': 'Buffy',
          'last-name': 'Summers',
          email: 'the-slayer@sunnydale.com',
          role: 'CERTIF',
          'user-id': 123,
          'is-super-admin': false,
          'is-certif': true,
          'is-metier': false,
          'is-support': false,
        },
      });
    });
  });
});
