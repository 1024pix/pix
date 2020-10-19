const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } = require('../../../test-helper');
const createServer = require('../../../../server');
const fs = require('fs');
const { stat } = require('fs').promises;
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');

describe('Acceptance | Controller | session-controller-import-certification-candidates-from-attendance-sheet', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/sessions/{id}/certification-candidates/import', () => {
    let user, sessionIdAllowed;

    beforeEach(async () => {
      // given
      user = databaseBuilder.factory.buildUser();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: otherUserId, certificationCenterId: otherCertificationCenterId });

      sessionIdAllowed = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-candidates').delete();
    });

    context('The user can access the session', () => {

      context('The ODS file to import is valid', () => {

        context('The ODS file contains regular data', () => {

          const odsFileName = 'files/import-certification-candidates-test-ok.ods';
          const odsFilePath = `${__dirname}/${odsFileName}`;
          let options;

          beforeEach(async () => {
            // given
            options = await createRequest({ odsFilePath, user, sessionIdAllowed });
          });

          it('should return an 204 status after success in importing the ods file', async () => {
            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(204);
          });
        });

        context('The ODS file contains birthdate with special format ( \'DD/MM/YYYY )', () => {

          const odsFileName = 'files/import-certification-candidates-test-special-birthdate-ok.ods';
          const odsFilePath = `${__dirname}/${odsFileName}`;
          let options;

          beforeEach(async () => {
            // given
            options = await createRequest({ odsFilePath, user, sessionIdAllowed });
          });

          it('should return an 204 status after success in importing the ods file', async () => {
            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(204);
          });
        });

      });

      context('The ODS file to extract is invalid and can\'t be imported', () => {

        const odsFileName = 'files/import-certification-candidates-test-ko-invalid-file.ods';
        const odsFilePath = `${__dirname}/${odsFileName}`;
        let options;

        beforeEach(async () => {
          // given
          options = await createRequest({ odsFilePath, user, sessionIdAllowed });
        });

        it('should return 422 status after failing in importing the ods file', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });

      });

    });

    context('The ODS file has been extracted but the data contained is invalid', () => {

      const odsFileName = 'files/import-certification-candidates-test-ko-invalid-data.ods';
      const odsFilePath = `${__dirname}/${odsFileName}`;
      let options;

      beforeEach(async () => {
        // given
        options = await createRequest({ odsFilePath, user, sessionIdAllowed });
      });

      it('should return a 422 status after error in data validity checker', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });

    });

    context('when at least one candidate is already linked to a user', () => {

      const odsFileName = 'files/import-certification-candidates-test-ok.ods';
      const odsFilePath = `${__dirname}/${odsFileName}`;
      let options;

      beforeEach(async () => {
        // given
        options = await createRequest({ odsFilePath, user, sessionIdAllowed });

        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId: sessionIdAllowed, userId });
        return databaseBuilder.commit();
      });

      it('should respond with a 400 when user cant import the candidates', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });

    });

  });

});

async function createRequest({ odsFilePath, user, sessionIdAllowed }) {
  const form = new FormData();
  const knownLength = await stat(odsFilePath).size;
  form.append('file', fs.createReadStream(odsFilePath), { knownLength });
  const payload = await streamToPromise(form);
  const authHeader = generateValidRequestAuthorizationHeader(user.id);
  const token = authHeader.replace('Bearer ', '');
  const headers = Object.assign({}, form.getHeaders(), { 'authorization': `Bearer ${token}` });
  return {
    method: 'POST',
    url: `/api/sessions/${sessionIdAllowed}/certification-candidates/import`,
    headers,
    payload,
  };
}
