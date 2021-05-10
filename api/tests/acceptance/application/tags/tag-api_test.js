const {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
} = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Route | tag-router', () => {

  describe('GET /api/tags', () => {

    it('should return a list of tags with 200 HTTP status code', async () => {
      // given
      const server = await createServer();
      const tag1 = databaseBuilder.factory.buildTag({ id: 1, name: 'TAG1' });
      const tag2 = databaseBuilder.factory.buildTag({ id: 2, name: 'TAG2' });
      const tag3 = databaseBuilder.factory.buildTag({ id: 3, name: 'TAG3' });
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/tags',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const expectedTags = [
        {
          'attributes': {
            'name': tag1.name,
          },
          'id': tag1.id.toString(),
          'type': 'tags',
        },
        {
          'attributes': {
            'name': tag2.name,
          },
          'id': tag2.id.toString(),
          'type': 'tags',
        },
        {
          'attributes': {
            'name': tag3.name,
          },
          'id': tag3.id.toString(),
          'type': 'tags',
        },
      ];

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedTags);
    });

  });

});
