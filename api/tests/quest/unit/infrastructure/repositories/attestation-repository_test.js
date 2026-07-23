import sinon from 'sinon';

import { Attestation } from '../../../../../src/profile/domain/models/Attestation.js';
import * as attestationRepository from '../../../../../src/quest/infrastructure/repositories/profile/attestation-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Repositories | attestation-repository', function () {
  let rewardApiStub, now;

  beforeEach(async function () {
    now = new Date();
    rewardApiStub = {
      getByIdAndType: sinon
        .stub()
        .resolves(
          new Attestation({ id: 1, templateName: 'templateName', key: 'KEY', label: 'attestation', createdAt: now }),
        ),
    };
  });
  describe('#getByRewardId', function () {
    it('should return an attestation key if reward id exists', async function () {
      const result = await attestationRepository.getByRewardId({ rewardId: 1, rewardApi: rewardApiStub });
      expect(result).to.be.instanceOf(Attestation);
      expect(result).to.deep.equal({
        id: 1,
        templateName: 'templateName',
        key: 'KEY',
        label: 'attestation',
        createdAt: now,
      });
    });
  });
});
