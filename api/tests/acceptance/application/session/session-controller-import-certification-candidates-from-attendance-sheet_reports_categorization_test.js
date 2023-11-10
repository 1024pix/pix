import { databaseBuilder, expect, generateValidRequestAuthorizationHeader, sinon } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { clearResolveMx, setResolveMx } from '../../../../src/shared/mail/infrastructure/services/mail-check.js';
import fs from 'fs';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Acceptance | Controller | session-controller-import-certification-candidates-from-attendance-sheet', function () {
  let server;
  let resolveMx;

  beforeEach(async function () {
    server = await createServer();
    resolveMx = sinon.stub();
    resolveMx.resolves();
    setResolveMx(resolveMx);
  });

  afterEach(async function () {
    server = await createServer();
    clearResolveMx();
  });

  describe('POST /api/sessions/{id}/certification-candidates/import', function () {
    let user, sessionIdAllowed;

    beforeEach(async function () {
      // given
      user = databaseBuilder.factory.buildUser();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: otherUserId,
        certificationCenterId: otherCertificationCenterId,
      });

      sessionIdAllowed = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

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
        databaseBuilder.factory.buildCertificationCandidate({ sessionId: sessionIdAllowed, userId });
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
