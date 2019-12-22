const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder,
} = require('../../../test-helper');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');
const fs = require('fs');
const createServer = require('../../../../server');

describe('PUT /api/sessions/:id/certifications/attendance-sheet-analysis', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  const odsFileName = 'files/attendance-sheet-analysis-test-ok.ods';
  const odsFilePath = `${__dirname}/${odsFileName}`;
  let options;

  context('User does not have the role PIX MASTER', () => {

    beforeEach(async () => {
      // given
      const user = databaseBuilder.factory.buildUser();
      const form = new FormData();
      form.append('file', fs.createReadStream(odsFilePath), { knownLength: fs.statSync(odsFilePath).size });
      const payload = await streamToPromise(form);
      const authHeader = generateValidRequestAuthorizationHeader(user.id);
      const token = authHeader.replace('Bearer ', '');
      const headers = Object.assign({}, form.getHeaders(), { 'authorization': `Bearer ${token}` });
      options = {
        method: 'PUT',
        url: '/api/sessions/1/certifications/attendance-sheet-analysis',
        payload,
        headers,
      };

      return databaseBuilder.commit();
    });

    it('will shut me down ', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });

  context('User has role PixMaster', () => {
    let sessionId;

    beforeEach(async () => {
      // given
      const user = databaseBuilder.factory.buildUser.withPixRolePixMaster();
      sessionId = databaseBuilder.factory.buildSession().id;

      databaseBuilder.factory.buildCertificationCandidate({ sessionId, firstName: 'Étienne', lastName: 'Lantier', birthdate: '1990-01-04', userId: null });
      databaseBuilder.factory.buildCertificationCandidate({ sessionId, firstName: 'Liam', lastName: 'Ranou', birthdate: '2000-10-22' });
      const form = new FormData();
      form.append('file', fs.createReadStream(odsFilePath), { knownLength: fs.statSync(odsFilePath).size });
      const payload = await streamToPromise(form);
      const authHeader = generateValidRequestAuthorizationHeader(user.id);
      const token = authHeader.replace('Bearer ', '');
      const headers = Object.assign({}, form.getHeaders(), { 'authorization': `Bearer ${token}` });
      options = {
        method: 'PUT',
        url: `/api/sessions/${sessionId}/certifications/attendance-sheet-analysis`,
        headers,
        payload,
      };

      return databaseBuilder.commit();
    });

    it('should return an 204 status after success parsing the ods file', async () => {
      const expectedResult = [ {
        lastName: 'Baudu',
        firstName: null,
        birthdate: '2008-12-25',
        birthplace: 'Metz',
        externalId: null,
        extraTimePercentage: 0.3,
        signature: 'x',
        certificationId: '1',
        lastScreen: 'x',
        comments: null,
      },
      {
        lastName: 'Lantier',
        firstName: 'Étienne',
        birthdate: '1990-01-04',
        birthplace: 'Ajaccio',
        externalId: 'ELAN123',
        extraTimePercentage: null,
        signature: 'x',
        certificationId: '2',
        lastScreen: null,
        lastScreenEnhanced: 'NOT_LINKED',
        comments: null,
      },
      {
        lastName: 'Ranou',
        firstName: 'Liam',
        birthdate: '2000-10-22',
        birthplace: null,
        externalId: null,
        extraTimePercentage: null,
        signature: null,
        certificationId: '3',
        lastScreen: null,
        lastScreenEnhanced: 'LINKED',
        comments: 'Commentaire',
      },
      {
        lastName: 'Bergoens',
        firstName: 'Laura',
        birthdate: '1998-08-06',
        birthplace: 'Perpignan',
        externalId: null,
        extraTimePercentage: null,
        signature: null,
        certificationId: null,
        lastScreen: null,
        lastScreenEnhanced: 'NOT_IN_SESSION',
        comments: null,
      }];
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedResult);
    });

  });

});
