const { expect } = require('./test-helper');

const { version } = require('../package.json');
const createServer = require('../server');
const config = require('../lib/config');

const xApiVersion = config.responseHeaders.xApiVersion.toLowerCase();
const accessControlExposeHeaders = config.responseHeaders.AccesControlExposeHeaders.toLowerCase();
const expectedAccessControlExposeHeaders = `${config.responseHeaders.xApiVersion},WWW-Authenticate,Server-Authorization`;

describe('Server', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  context('#setVersionHeaders', () => {

    it('should set the correct version headers on normal responses', async () => {
      const response = await server.inject('/api');

      expect(response.headers[xApiVersion]).to.equal(version);
      expect(response.headers[accessControlExposeHeaders]).to.equal(expectedAccessControlExposeHeaders);
    });

    it('should set the correct version headers on error responses', async () => {
      const response = await server.inject('/api/organizations/1');

      expect(response.headers[xApiVersion]).to.equal(version);
      expect(response.headers[accessControlExposeHeaders]).to.equal(expectedAccessControlExposeHeaders);
    });

  });

});
