const SmartFuzz = require('../../tooling/smart-fuzz');
const createServer = require('../../../server');

describe('Acceptance | Fuzz', function () {
  it('should fuzz', async function () {
    const testServer = await createServer();
    try {
      await SmartFuzz({ server: testServer });
    } finally {
      await testServer.stop();
    }
  });
});
