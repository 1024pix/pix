import lodash from 'lodash';

import * as temporarySessionsStorageForMassImportService from '../../../../../src/certification/enrolment/domain/services/temporary-sessions-storage-for-mass-import-service.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  sinon,
} from '../../../../test-helper.js';

const { omit } = lodash;

describe('Acceptance | Controller | Session | session-mass-import-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/certification-centers/{certificationCenterId}/sessions/validate-for-mass-import', function () {
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-01-01'),
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    context('when user validate sessions for import', function () {
      it('should return status 200', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          type: CERTIFICATION_CENTER_TYPES.SUP,
          externalId: '1234AB',
        }).id;
        const { id: complementaryCertificationId } =
          databaseBuilder.factory.buildComplementaryCertification.pixEdu2ndDegre({});
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: certificationCenterId,
          complementaryCertificationId,
        });
        databaseBuilder.factory.buildOrganization({ externalId: '1234AB', isManagingStudents: false, type: 'SUP' });
        databaseBuilder.factory.buildCertificationCpfCountry({
          commonName: 'FRANCE',
          matcher: 'ACEFNR',
          code: '99100',
        });
        databaseBuilder.factory.buildCertificationCpfCity({
          INSEECode: '75115',
          name: 'Paris',
          isActualName: true,
        });
        databaseBuilder.factory.buildComplementaryCertification({ id: 1, label: 'Pix+ Édu 2nd degré', key: 'A' });
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          label: 'Pix+ Édu 2nd degré',
          complementaryCertificationId: 1,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        await databaseBuilder.commit();

        const newBuffer = `Numéro de session préexistante,* Nom du site,* Nom de la salle,* Date de début (format: JJ/MM/AAAA),* Heure de début (heure locale format: HH:MM),* Surveillant(s),Observations (optionnel),* Nom de naissance,* Prénom,* Date de naissance (format: JJ/MM/AAAA),* Sexe (M ou F),Code INSEE de la commune de naissance,Code postal de la commune de naissance,Nom de la commune de naissance,* Pays de naissance,"E-mail du destinataire des résultats (formateur, enseignant…)",E-mail de convocation,Identifiant externe,Temps majoré ? (exemple format: 33%),"* Tarification part Pix (Gratuite, Prépayée ou Payante)",Code de prépaiement (si Tarification part Pix Prépayée),CléA Numérique ('oui' ou laisser vide),Pix+ Droit ('oui' ou laisser vide),Pix+ Édu 1er degré ('oui' ou laisser vide),Pix+ Édu 2nd degré ('oui' ou laisser vide)
        ,site,salle,10/10/2025,12:00,surveillant,,noel,jean,10/10/2000,M,75115,,,FRANCE,,,,,Gratuite,,,,,oui`;

        const options = {
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/sessions/validate-for-mass-import`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          payload: newBuffer,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(_checkIfValidUUID(response.result.cachedValidatedSessionsKey)).to.be.true;
        expect(omit(response.result, 'cachedValidatedSessionsKey')).to.deep.equal({
          candidatesCount: 1,
          errorReports: [],
          sessionsCount: 1,
          sessionsWithoutCandidatesCount: 0,
        });
      });
    });

    context('when user validate candidates on existing session with candidates', function () {
      context('when csv first line has sessionId and no session information', function () {
        context('when csv last line has sessionId and session information', function () {
          it('should throw and do nothing', async function () {
            // given
            const userId = databaseBuilder.factory.buildUser().id;
            const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
              externalId: '1234AB',
              type: CERTIFICATION_CENTER_TYPES.SUP,
            }).id;
            databaseBuilder.factory.buildOrganization({ externalId: '1234AB', isManagingStudents: false, type: 'SUP' });
            databaseBuilder.factory.buildCertificationCpfCountry({
              commonName: 'FRANCE',
              matcher: 'ACEFNR',
              code: '99100',
            });
            databaseBuilder.factory.buildCertificationCpfCity({
              INSEECode: '75115',
              name: 'Paris',
              isActualName: true,
            });
            databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
            const sessionId = databaseBuilder.factory.buildSession({ id: 1234, certificationCenterId }).id;
            const toto = databaseBuilder.factory.buildCertificationCandidate({ sessionId, lastName: 'Toto' });
            databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: toto.id });
            const foo = databaseBuilder.factory.buildCertificationCandidate({ sessionId, lastName: 'Foo' });
            databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: foo.id });
            const bar = databaseBuilder.factory.buildCertificationCandidate({ sessionId, lastName: 'Bar' });
            databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: bar.id });
            await databaseBuilder.commit();

            const newBuffer = `Numéro de session préexistante;* Nom du site;* Nom de la salle;* Date de début (format: JJ/MM/AAAA);* Heure de début (heure locale format: HH:MM);* Surveillant(s);Observations (optionnel);* Nom de naissance;* Prénom;* Date de naissance (format: JJ/MM/AAAA);* Sexe (M ou F);Code INSEE de la commune de naissance;Code postal de la commune de naissance;Nom de la commune de naissance;* Pays de naissance;E-mail du destinataire des résultats (formateur, enseignant…);E-mail de convocation;Identifiant externe;Temps majoré ? (exemple format: 33%);* Tarification part Pix (Gratuite, Prépayée ou Payante);Code de prépaiement (si Tarification part Pix Prépayée)
          ${sessionId};;;;;;;Tutu;Jean-Paul;01/01/2000;M;75115;;;FRANCE;;;;;Gratuite;;
          ${sessionId};site1;salle1;19/10/2023;12:00;surveillant;non;Tata;Corinne;01/01/2000;M;75115;;;FRANCE;;;;;Gratuite;;`;

            const options = {
              method: 'POST',
              url: `/api/certification-centers/${certificationCenterId}/sessions/validate-for-mass-import`,
              headers: {
                authorization: generateValidRequestAuthorizationHeader(userId),
              },
              payload: newBuffer,
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.deep.equal({
              cachedValidatedSessionsKey: undefined,
              sessionsCount: 2,
              sessionsWithoutCandidatesCount: 0,
              candidatesCount: 2,
              errorReports: [
                {
                  code: 'INFORMATION_NOT_ALLOWED_WITH_SESSION_ID',
                  line: 3,
                  isBlocking: true,
                },
              ],
            });
          });
        });
      });
    });
  });

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
            invigilatorPassword: 'KV2CPA',
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
          expect(sessions[0].invigilatorPassword).to.equal(sessionToSave.invigilatorPassword);
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
            invigilatorPassword: 'KV2CPA',
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
          expect(sessions[0].invigilatorPassword).to.equal(sessionToSave.invigilatorPassword);
          expect(sessions[0].version).to.equal(3);
          expect(response.statusCode).to.equal(201);
        });
      });
    });
  });

  describe('GET /api/certification-centers/{certificationCenterId}/import', function () {
    const BOM_CHAR = '\ufeff';

    it('should return the CSV template', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter({
        type: 'SCO',
        externalId: '1234AB',
        isV3Pilot: false,
      });
      const { id: complementaryCertificationId } = databaseBuilder.factory.buildComplementaryCertification.droit({});
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId,
        complementaryCertificationId,
      });
      databaseBuilder.factory.buildOrganization({ externalId: '1234AB', isManagingStudents: false, type: 'SCO' });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
      });
      await databaseBuilder.commit();
      const server = await createServer();

      const options = {
        method: 'GET',
        url: `/api/certification-centers/${certificationCenterId}/import`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal(
        `${BOM_CHAR}"Numéro de session préexistante";"* Nom du site";"* Nom de la salle";"* Date de début (format: JJ/MM/AAAA)";"* Heure de début (heure locale format: HH:MM)";"* Surveillant(s)";"Observations (optionnel)";"* Nom de naissance";"* Prénom";"* Date de naissance (format: JJ/MM/AAAA)";"* Sexe (M ou F)";"Code INSEE de la commune de naissance";"Code postal de la commune de naissance";"Nom de la commune de naissance";"* Pays de naissance";"E-mail du destinataire des résultats (formateur, enseignant…)";"E-mail de convocation";"Identifiant externe";"Temps majoré ? (exemple format: 33%)";"Pix+ Droit ('oui' ou laisser vide)"`,
      );
    });
  });
});

function _checkIfValidUUID(str) {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(str);
}
