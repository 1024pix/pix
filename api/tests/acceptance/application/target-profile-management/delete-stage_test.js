const { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Target Profile Management | DELETE /api/admin/stages/:id', function () {
  let server, options;

  beforeEach(async function () {
    const adminUserId = databaseBuilder.factory.buildUser.withRole().id;
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    databaseBuilder.factory.buildStage({ id: 4, targetProfileId, level: null, threshold: 80 });
    server = await createServer();
    options = {
      method: 'DELETE',
      url: '/api/admin/stages/4',
      headers: { authorization: generateValidRequestAuthorizationHeader(adminUserId) },
      payload: {
        data: {
          id: 4,
          attributes: {
            level: null,
            threshold: 65,
            targetProfileId,
            title: 'nouveau palier titre',
            message: 'nouveau palier message',
            'prescriber-title': 'nouveau palier prescripteur titre',
            'prescriber-description': 'nouveau palier prescripteur description',
          },
          relationships: {
            'target-profile': { data: { id: targetProfileId } },
          },
        },
      },
    };
    await databaseBuilder.commit();
  });

  afterEach(async function () {
    return knex('stages').delete();
  });

  it('should return 204 status code', async function () {
    // when
    const response = await server.inject(options);

    // then
    expect(response.statusCode).to.equal(204);
  });
});
