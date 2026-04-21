import { databaseBuilder } from '../../../tooling/databases.js';
import { mockAttestationStorage } from '../../../tooling/mocks/attestation-storage.mock.js';
import { server } from '../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Profile | Acceptance | Application | Attestation Route ', function () {
  describe('GET /api/admin/attestations', function () {
    it('should return 200 with the list of attestations', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      databaseBuilder.factory.buildAttestation({ key: 'PARENTHOOD', label: 'Parentalité' });
      databaseBuilder.factory.buildAttestation({ key: 'SIXTH_GRADE', label: '6ème' });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        url: '/api/admin/attestations',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(2);
    });
  });

  describe('GET /api/users/{userId}/attestations/{attestationKey}', function () {
    it('should be ok', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const attestation = databaseBuilder.factory.buildAttestation();
      await databaseBuilder.commit();

      mockAttestationStorage(attestation);

      const options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        url: `/api/users/${userId}/attestations/${attestation.key}`,
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
