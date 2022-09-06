const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Routes | Stages', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/stages', function () {
    let options;
    let targetProfileId;

    beforeEach(async function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const adminUserId = databaseBuilder.factory.buildUser.withRole().id;
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/admin/stages',
        payload: {
          data: {
            type: 'stages',
            attributes: {
              title: 'titreA',
              message: 'messageA',
              'target-profile-id': targetProfileId,
              level: 4,
              threshold: null,
            },
          },
        },
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUserId),
        },
      };
    });

    afterEach(function () {
      return knex('stages').delete();
    });

    it('should return the created stage', async function () {
      // when
      const response = await server.inject(options);

      // then
      const ids = await knex('stages').pluck('id').orderBy('title', 'ASC');
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'stages',
        attributes: {
          title: 'titreA',
          message: 'messageA',
          threshold: null,
          'prescriber-title': null,
          'prescriber-description': null,
        },
        id: `${ids[0]}`,
      });
    });
  });
});
