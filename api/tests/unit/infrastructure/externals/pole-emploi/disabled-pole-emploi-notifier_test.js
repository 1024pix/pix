import { expect } from '../../../../test-helper.js';
import { notify } from '../../../../../lib/infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js';

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
