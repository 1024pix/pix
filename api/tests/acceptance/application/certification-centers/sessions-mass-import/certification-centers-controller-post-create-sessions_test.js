const { expect, databaseBuilder, knex, generateValidRequestAuthorizationHeader } = require('../../../../test-helper');
const createServer = require('../../../../../server');
const temporarySessionsStorageForMassImportService = require('../../../../../lib/domain/services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service');

describe('Acceptance | Controller | certification-centers-controller-post-create-sessions', function () {
  describe('POST /api/certification-centers/{certificationCenterId}/sessions/confirm-for-mass-import', function () {
    afterEach(async function () {
      await knex('sessions').delete();
      await knex('certification-center-memberships').delete();
      await knex('certification-centers').delete();
      await knex('users').delete();
    });

    context('when user confirm sessions for import', function () {
      it('should return status 201', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const { name: certificationCenter, id: certificationCenterId } =
          databaseBuilder.factory.buildCertificationCenter();
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId,
          certificationCenterId,
        });
        const sessionToSave = {
          id: undefined,
          certificationCenterId,
          certificationCenter,
          address: '3 rue du Chateau',
          examiner: 'John Smith',
          room: 'room',
          date: '2023-01-01',
          time: '11:00',
          accessCode: 'accessCode',
          supervisorPassword: 'KV2CP',
          certificationCandidates: [],
        };
        const newCachedSessionUUID = await temporarySessionsStorageForMassImportService.save({
          sessions: [sessionToSave],
          userId,
        });
        await databaseBuilder.commit();
        const server = await createServer();

        const options = {
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/sessions/confirm-for-mass-import`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: { data: { attributes: { cachedValidatedSessionsKey: newCachedSessionUUID } } },
        };

        // when
        const response = await server.inject(options);

        // then
        const sessions = await knex('sessions');
        expect(sessions.length).to.equal(1);
        expect(sessions[0].certificationCenter).to.equal(certificationCenter);
        expect(sessions[0].supervisorPassword).to.equal(sessionToSave.supervisorPassword);
        expect(response.statusCode).to.equal(201);
      });
    });
  });
});
