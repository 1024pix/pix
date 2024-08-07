import fs from 'node:fs';
import * as url from 'node:url';

import { clearResolveMx, setResolveMx } from '../../../../../src/shared/mail/infrastructure/services/mail-check.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  sinon,
} from '../../../../test-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Certification | Enrolment | Acceptance | Application | Routes | enrolment', function () {
  let server;
  let options;
  let payload;
  let userId;
  let resolveMx;

  describe('PUT /api/sessions/{id}/enrol-students-to-session', function () {
    beforeEach(async function () {
      server = await createServer();
      userId = databaseBuilder.factory.buildUser().id;
      options = {
        method: 'POST',
        url: '/api/sessions/1/enrol-students-to-session',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      return databaseBuilder.commit();
    });

    context('when user is not authenticated', function () {
      beforeEach(function () {
        options = {
          method: 'PUT',
          url: '/api/sessions/1/enrol-students-to-session',
          headers: { authorization: 'invalid.access.token' },
        };
      });

      it('should respond with a 401 - unauthorized access', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when session id is not an integer', function () {
      beforeEach(function () {
        options = {
          method: 'PUT',
          url: '/api/sessions/2.1/enrol-students-to-session',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should respond with a 400 - Bad Request', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors[0].title).to.equal('Bad Request');
      });
    });

    context('when user is authenticated', function () {
      let sessionId;
      let organizationLearner;
      let country;
      const birthCityCode = 'Detroit313';
      const FRANCE_INSEE_CODE = '99100';
      const FRANCE_ORGANIZATION_LEARNER_INSEE_CODE = '100';

      beforeEach(async function () {
        const { id: certificationCenterId, externalId } = databaseBuilder.factory.buildCertificationCenter({
          type: 'SCO',
        });

        sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
        const { id: organizationId } = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          externalId,
        });
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        country = databaseBuilder.factory.buildCertificationCpfCountry({
          code: FRANCE_INSEE_CODE,
          commonName: 'FRANCE',
          originalName: 'FRANCE',
        });

        organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId,
          birthCityCode,
          birthCountryCode: FRANCE_ORGANIZATION_LEARNER_INSEE_CODE,
        });

        await databaseBuilder.commit();
        payload = {
          data: {
            attributes: {
              'organization-learner-ids': [organizationLearner.id],
            },
          },
        };
        options = {
          method: 'PUT',
          url: `/api/sessions/${sessionId}/enrol-students-to-session`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload,
        };
      });

      it('should respond with a 201', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        sinon.assert.match(response.result, {
          data: [
            {
              type: 'certification-candidates',
              id: sinon.match.string,
              attributes: {
                'billing-mode': null,
                'prepayment-code': null,
                'birth-city': organizationLearner.birthCity,
                birthdate: organizationLearner.birthdate,
                'first-name': organizationLearner.firstName,
                'birth-country': country.commonName,
                'is-linked': false,
                'last-name': organizationLearner.lastName,
                'birth-province-code': null,
                'birth-insee-code': birthCityCode,
                'birth-postal-code': null,
                email: null,
                'external-id': null,
                'extra-time-percentage': null,
                'result-recipient-email': null,
                'organization-learner-id': organizationLearner.id,
                sex: 'M',
                'complementary-certification': null,
              },
              relationships: {
                subscriptions: {
                  data: [
                    {
                      type: 'subscriptions',
                      id: sinon.match.string,
                    },
                  ],
                },
              },
            },
          ],
          included: [
            {
              type: 'subscriptions',
              id: sinon.match.string,
              attributes: {
                type: 'CORE',
                'complementary-certification-id': null,
              },
            },
          ],
        });
      });
    });
  });

  describe('GET /api/sessions/{id}/candidates-import-sheet', function () {
    it('should respond with a 200 when session can be found', async function () {
      // given
      server = await createServer();
      const user = databaseBuilder.factory.buildUser();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: otherUserId,
        certificationCenterId: otherCertificationCenterId,
      });

      const sessionIdAllowed = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      await databaseBuilder.commit();

      // when
      const options = {
        method: 'GET',
        url: `/api/sessions/${sessionIdAllowed}/candidates-import-sheet`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/certification-candidates/import', function () {
    let user, sessionIdAllowed;

    beforeEach(async function () {
      server = await createServer();
      resolveMx = sinon.stub();
      resolveMx.resolves();
      setResolveMx(resolveMx);

      // given
      user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildCertificationCenter({ id: 22 });
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId: 22 });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: otherUserId,
        certificationCenterId: otherCertificationCenterId,
      });

      sessionIdAllowed = databaseBuilder.factory.buildSession({ certificationCenterId: 22 }).id;

      databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99100',
        commonName: 'FRANCE',
        originalName: 'FRANCE',
        matcher: 'ACEFNR',
      });
      databaseBuilder.factory.buildCertificationCpfCountry({
        code: '99132',
        commonName: 'ANGLETERRE',
        originalName: 'ANGLETERRE',
        matcher: 'AEEEGLNRRT',
      });

      databaseBuilder.factory.buildCertificationCpfCity({ name: 'AJACCIO', INSEECode: '2A004', isActualName: true });
      databaseBuilder.factory.buildCertificationCpfCity({ name: 'PARIS 18', postalCode: '75018', isActualName: true });
      databaseBuilder.factory.buildCertificationCpfCity({
        name: 'SAINT-ANNE',
        postalCode: '97180',
        isActualName: true,
      });

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      server = await createServer();
      clearResolveMx();
    });

    context('The user can access the session', function () {
      context('The ODS file to import is valid', function () {
        context('The ODS file contains regular data', function () {
          it('should return an 204 status after success in importing the ods file', async function () {
            // given
            const odsFileName = 'files/1.5/import-certification-candidates-reports-categorization-test-ok.ods';
            const odsFilePath = `${__dirname}/${odsFileName}`;
            const options = generateOptions({ odsFilePath, userId: user.id, sessionId: sessionIdAllowed });

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(204);
          });

          context('when there is one candidate registered for a complementary certification', function () {
            it('should return an 204 status after success in importing the ods file', async function () {
              // given
              databaseBuilder.factory.buildComplementaryCertification({
                id: 99,
                key: 'PRO_SANTE',
                label: 'Label de bonne santé',
              });

              databaseBuilder.factory.buildComplementaryCertificationHabilitation({
                complementaryCertificationId: 99,
                certificationCenterId: 22,
              });

              await databaseBuilder.commit();

              const odsFileName =
                'files/1.5/import-certification-candidates-reports-categorization-test-complementary-ok.ods';
              const odsFilePath = `${__dirname}/${odsFileName}`;
              const options = generateOptions({ odsFilePath, userId: user.id, sessionId: sessionIdAllowed });

              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(204);
            });
          });
        });

        context("The ODS file contains birthdate with special format ( 'DD/MM/YYYY )", function () {
          it('should return an 204 status after success in importing the ods file', async function () {
            // given
            const odsFileName =
              'files/1.5/import-certification-candidates-reports-categorization-test-special-birthdate-ok.ods';
            const odsFilePath = `${__dirname}/${odsFileName}`;
            const options = generateOptions({ odsFilePath, userId: user.id, sessionId: sessionIdAllowed });

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(204);
          });
        });
      });

      context("The ODS file to extract is invalid and can't be imported", function () {
        it('should return 422 status after failing in importing the ods file', async function () {
          // given
          const odsFileName =
            'files/1.5/import-certification-candidates-reports-categorization-test-ko-invalid-file.ods';
          const odsFilePath = `${__dirname}/${odsFileName}`;
          const options = generateOptions({ odsFilePath, userId: user.id, sessionId: sessionIdAllowed });

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });

    context('The ODS file has been extracted but the data contained is invalid', function () {
      it('should return a 422 status after error in data validity checker', async function () {
        // given
        const odsFileName = 'files/1.5/import-certification-candidates-reports-categorization-test-ko-invalid-data.ods';
        const odsFilePath = `${__dirname}/${odsFileName}`;
        const options = generateOptions({ odsFilePath, userId: user.id, sessionId: sessionIdAllowed });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });

    context('when at least one candidate is already linked to a user', function () {
      it('should respond with a 403 when user cant import the candidates', async function () {
        // given
        const odsFileName = 'files/1.5/import-certification-candidates-reports-categorization-test-ok.ods';
        const odsFilePath = `${__dirname}/${odsFileName}`;
        const options = generateOptions({ odsFilePath, userId: user.id, sessionId: sessionIdAllowed });

        const userId = databaseBuilder.factory.buildUser().id;
        const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId: sessionIdAllowed, userId });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});

function generateOptions({ odsFilePath, userId, sessionId }) {
  return {
    method: 'POST',
    url: `/api/sessions/${sessionId}/certification-candidates/import`,
    headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
    payload: fs.createReadStream(odsFilePath),
  };
}
