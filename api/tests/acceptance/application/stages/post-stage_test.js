import { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Stages | POST /api/admin/stages', function () {
  let server, options;

  beforeEach(async function () {
    const adminUserId = databaseBuilder.factory.buildUser.withRole().id;
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    server = await createServer();
    options = {
      method: 'POST',
      url: '/api/admin/stages',
      headers: { authorization: generateValidRequestAuthorizationHeader(adminUserId) },
      payload: {
        data: {
          attributes: {
            level: null,
            threshold: 65,
            title: 'nouveau palier titre',
            message: 'nouveau palier message',
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

  it('should return 201 status code', async function () {
    // when
    const response = await server.inject(options);

    // then
    expect(response.statusCode).to.equal(201);
  });
});
