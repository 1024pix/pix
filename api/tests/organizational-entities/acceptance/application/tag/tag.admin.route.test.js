import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Acceptance | Organizational Entities | Application | Route | Admin | Organization', function () {
  describe('POST /api/admin/tags', function () {
    context('when request is valid', function () {
      it('returns the created tag with 201 HTTP status code', async function () {
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
    });

    context('when authenticated user is not SuperAdmin', function () {
      it('return 403 HTTP status code', async function () {
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
  });
});
