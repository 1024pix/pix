const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const FormData = require('form-data');
const fs = require('node:fs');
const { stat } = require('node:fs/promises');
const streamToPromise = require('stream-to-promise');

describe('Acceptance | Controller | session-controller-post-import-sessions', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/sessions/import', function () {
    context('when user imports sessions', function () {
      it('should return status 200', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        const csvFileName = 'files/sessions-import/sessions.csv';
        const csvFilePath = `${__dirname}/${csvFileName}`;
        const options = await createRequest({ csvFilePath, userId });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});

async function createRequest({ csvFilePath, userId }) {
  const form = new FormData();
  const knownLength = await stat(csvFilePath).size;
  form.append('file', fs.createReadStream(csvFilePath), { knownLength });
  const payload = await streamToPromise(form);
  const authHeader = generateValidRequestAuthorizationHeader(userId);
  const token = authHeader.replace('Bearer ', '');
  const headers = Object.assign({}, form.getHeaders(), { authorization: `Bearer ${token}` });
  return {
    method: 'POST',
    url: `/api/sessions/import`,
    headers,
    payload,
  };
}
