const { expect } = require('../../../../test-helper');
const { notify } = require('../../../../../lib/infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier');

describe('Unit | Infrastructure | Externals/Pole-Emploi | pole-emploi-notifier', function () {
  describe('#notify', function () {
    it("returns failed results with the code 'SENDING-DISABLED'", async function () {
      const results = await notify();

      expect(results).to.deep.equal({
        isSuccessful: false,
        code: 'SENDING-DISABLED',
      });
    });
  });
});
