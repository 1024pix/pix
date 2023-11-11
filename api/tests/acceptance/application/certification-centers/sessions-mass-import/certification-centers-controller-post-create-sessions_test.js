import { expect, databaseBuilder, knex, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import * as temporarySessionsStorageForMassImportService from '../../../../../lib/domain/services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service.js';

describe('Acceptance | Controller | certification-centers-controller-post-create-sessions', function () {
  describe('POST /api/certification-centers/{certificationCenterId}/sessions/confirm-for-mass-import', function () {
    context('when certification center is not V3 Pilot', function () {
      context('when user confirm sessions for import', function () {
        it('should return status 201', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const { name: certificationCenter, id: certificationCenterId } =
            databaseBuilder.factory.buildCertificationCenter({
              type: 'SUP',
              externalId: '1234AB',
              isV3Pilot: false,
            });
          databaseBuilder.factory.buildOrganization({ externalId: '1234AB', isManagingStudents: false, type: 'SUP' });
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
          expect(sessions[0].version).to.equal(2);
          expect(response.statusCode).to.equal(201);
        });
      });
    });

    context('when certification center is V3 Pilot', function () {
      context('when user confirm sessions for import', function () {
        it('should return status 201', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const { name: certificationCenter, id: certificationCenterId } =
            databaseBuilder.factory.buildCertificationCenter({
              type: 'SUP',
              externalId: '1234AB',
              isV3Pilot: true,
            });
          databaseBuilder.factory.buildOrganization({ externalId: '1234AB', isManagingStudents: false, type: 'SUP' });
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
          expect(sessions[0].version).to.equal(3);
          expect(response.statusCode).to.equal(201);
        });
      });
    });
  });
});
