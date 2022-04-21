const {
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  databaseBuilder,
  knex,
} = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Route | tag-router', function () {
  describe('POST /api/admin/tags', function () {
    afterEach(async function () {
      await knex('tags').delete();
    });

    it('should return the created tag with 201 HTTP status code', async function () {
      // given
      const tagName = 'SUPER TAG';
      const server = await createServer();
      await databaseBuilder.commit();

      const userId = (await insertUserWithRoleSuperAdmin()).id;

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/tags',
        payload: {
          data: {
            type: 'tags',
            attributes: {
              name: tagName,
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.deep.equal('tags');
      expect(response.result.data.attributes.name).to.deep.equal(tagName);
    });

    it('should return 403 HTTP status code when the user authenticated is not SuperAdmin', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const tagName = 'un super tag';

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/tags',
        payload: {
          data: {
            type: 'tags',
            attributes: {
              name: tagName,
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/tags', function () {
    it('should return a list of tags with 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const tag1 = databaseBuilder.factory.buildTag({ name: 'TAG1' });
      const tag2 = databaseBuilder.factory.buildTag({ name: 'TAG2' });
      await databaseBuilder.commit();

      const userId = (await insertUserWithRoleSuperAdmin()).id;

      const options = {
        method: 'GET',
        url: '/api/admin/tags',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const expectedTags = [
        {
          attributes: {
            name: tag1.name,
          },
          id: tag1.id.toString(),
          type: 'tags',
        },
        {
          attributes: {
            name: tag2.name,
          },
          id: tag2.id.toString(),
          type: 'tags',
        },
      ];

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedTags);
    });

    it('should return 403 HTTP status code when the user authenticated is not SuperAdmin', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/tags',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
