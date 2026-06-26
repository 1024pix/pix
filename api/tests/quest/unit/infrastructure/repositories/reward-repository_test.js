import sinon from 'sinon';

import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { getByAttestationKey } from '../../../../../src/quest/infrastructure/repositories/reward-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Repositories | Reward', function () {
  describe('#getByAttestationKey', function () {
    let rewardApiStub;
    beforeEach(function () {
      rewardApiStub = {
        getByAttestationKey: sinon.stub(),
      };

      rewardApiStub.getByAttestationKey
        .withArgs({ key: 'PARENTHOOD' })
        .resolves({ id: 1, type: REWARD_TYPES.ATTESTATION });
    });

    it('should return a reward for given attestation key', async function () {
      const result = await getByAttestationKey({ key: 'PARENTHOOD', rewardApi: rewardApiStub });

      expect(result.id).to.equal(1);
    });
  });
});
