const SmartFuzz = require('./smart-fuzz');
const createServer = require('../../server');

describe('Unit | Fuzz', function () {
  it('should fuzz', async function () {
    const testServer = await createServer();
    try {
      await SmartFuzz({ server: testServer });
    } finally {
      await testServer.stop();
    }
  });
});
