const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const fs = require('fs');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');

describe('Acceptance | Controller | session-controller-parse-certification-candidates-from-attendance-sheet', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/sessions/{id}/certification-candidates/parse-from-attendance-sheet', () => {
    let user, sessionIdAllowed, sessionIdNotAllowed;

    beforeEach(async () => {
      // given
      user = databaseBuilder.factory.buildUser();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: otherUserId, certificationCenterId: otherCertificationCenterId });

      sessionIdAllowed = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      sessionIdNotAllowed = databaseBuilder.factory.buildSession({ certificationCenterId: otherCertificationCenterId });

      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    context('The user can access the session', () => {

      context('The ODS file to parse is valid', () => {

        const odsFileName = 'attendance_sheet_parsing_ok_test.ods';
        const odsFilePath = `${__dirname}/${odsFileName}`;
        let options;

        beforeEach(async () => {
          // given
          const form = new FormData();
          form.append('file', fs.createReadStream(odsFilePath), { knownLength: fs.statSync(odsFilePath).size });
          const payload = await streamToPromise(form);
          const authHeader = generateValidRequestAuhorizationHeader(user.id);
          const token = authHeader.replace('Bearer ', '');
          const headers = Object.assign({}, form.getHeaders(), { 'authorization': `Bearer ${token}` });
          options = {
            method: 'POST',
            url: `/api/sessions/${sessionIdAllowed}/certification-candidates/parse-from-attendance-sheet`,
            headers,
            payload,
          };

        });

        it('should return an OK status after success in parsing the ods file', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

      });

      context('The ODS file to parse is invalid', () => {

        const odsFileName = 'attendance_sheet_parsing_ko_test.ods';
        const odsFilePath = `${__dirname}/${odsFileName}`;
        let options;

        beforeEach(async () => {
          // given
          const form = new FormData();
          form.append('file', fs.createReadStream(odsFilePath), { knownLength: fs.statSync(odsFilePath).size });
          const payload = await streamToPromise(form);
          const authHeader = generateValidRequestAuhorizationHeader(user.id);
          const token = authHeader.replace('Bearer ', '');
          const headers = Object.assign({}, form.getHeaders(), { 'authorization': `Bearer ${token}` });
          options = {
            method: 'POST',
            url: `/api/sessions/${sessionIdAllowed}/certification-candidates/parse-from-attendance-sheet`,
            headers,
            payload,
          };

        });

        it('should return an KO status after failing in parsing the ods file', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });

      });

    });

    context('The user can\'t access the session', () => {

      const odsFileName = 'attendance_sheet_parsing_ok_test.ods';
      const odsFilePath = `${__dirname}/${odsFileName}`;
      let options;

      beforeEach(async () => {
        // given
        const form = new FormData();
        form.append('file', fs.createReadStream(odsFilePath), { knownLength: fs.statSync(odsFilePath).size });
        const payload = await streamToPromise(form);
        const authHeader = generateValidRequestAuhorizationHeader(user.id);
        const token = authHeader.replace('Bearer ', '');
        const headers = Object.assign({}, form.getHeaders(), { 'authorization': `Bearer ${token}` });
        options = {
          method: 'POST',
          url: `/api/sessions/${sessionIdNotAllowed}/certification-candidates/parse-from-attendance-sheet`,
          headers,
          payload,
        };

      });

      it('should respond with a 403 when user cant access the session', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

    });

  });

});
