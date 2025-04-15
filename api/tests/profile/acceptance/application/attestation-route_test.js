import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
} from '../../../test-helper.js';

describe('Profile | Acceptance | Application | Attestation Route ', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/users/{userId}/attestations/{attestationKey}', function () {
    it('should be ok', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const attestationKey = databaseBuilder.factory.buildAttestation().key;

      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        url: `/api/users/${userId}/attestations/${attestationKey}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/users/{userId}/attestation-details', function () {
    it('should be ok', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        url: `/api/users/${userId}/attestation-details`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
