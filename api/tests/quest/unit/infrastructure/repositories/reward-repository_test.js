import sinon from 'sinon';

import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { QuestResult } from '../../../../../src/quest/domain/models/quests/value-objects/QuestResult.js';
import {
  getByAttestationKey,
  getByQuestAndUserId,
} from '../../../../../src/quest/infrastructure/repositories/reward-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Repositories | Reward', function () {
  describe('#getByQuestAndUserId', function () {
    let userId;
    let quest;
    let reward;
    let rewardApiStub;
    let profileRewardApiStub;
    let profileRewardTemporaryStorageStub;

    beforeEach(function () {
      userId = Symbol('userId');
      quest = {
        id: 1,
        rewardId: Symbol('rewardId'),
        rewardType: Symbol('rewardType'),
      };
      reward = { id: 1, label: 'Label' };
      rewardApiStub = {
        getByIdAndType: sinon.stub(),
      };
      profileRewardApiStub = {
        getByUserId: sinon.stub(),
      };
      profileRewardTemporaryStorageStub = {
        get: sinon.stub(),
      };

      rewardApiStub.getByIdAndType
        .withArgs({ rewardId: quest.rewardId, rewardType: quest.rewardType })
        .resolves(reward);
    });

    it('should return QuestResult with obtained true when reward is obtained', async function () {
      // given
      const profileReward = [{ rewardId: quest.rewardId, rewardType: quest.rewardType, profileRewardId: 1 }];
      profileRewardApiStub.getByUserId.withArgs(userId).resolves(profileReward);

      // when
      const result = await getByQuestAndUserId({
        userId,
        quest,
        rewardApi: rewardApiStub,
        profileRewardApi: profileRewardApiStub,
        profileRewardTemporaryStorage: profileRewardTemporaryStorageStub,
      });

      // then
      expect(result).to.be.an.instanceof(QuestResult);
      expect(result.id).to.equal(quest.id);
      expect(result.profileRewardId).to.equal(profileReward.profileRewardId);
      expect(result.reward).to.equal(reward);
      expect(result.obtained).to.be.true;
    });

    it('should return QuestResult with obtained false when reward is not obtained', async function () {
      // given
      const profileReward = [];

      profileRewardApiStub.getByUserId.withArgs(userId).resolves(profileReward);
      profileRewardTemporaryStorageStub.get.withArgs(userId).resolves(0);

      // when
      const result = await getByQuestAndUserId({
        userId,
        quest,
        rewardApi: rewardApiStub,
        profileRewardApi: profileRewardApiStub,
        profileRewardTemporaryStorage: profileRewardTemporaryStorageStub,
      });

      // then
      expect(result).to.be.an.instanceof(QuestResult);
      expect(result.id).to.equal(quest.id);
      expect(result.reward).to.equal(reward);
      expect(result.profileRewardId).to.be.null;
      expect(result.obtained).to.be.false;
    });

    it('should return QuestResult with obtained null when reward is processing', async function () {
      // given
      const profileReward = [];

      profileRewardApiStub.getByUserId.withArgs(userId).resolves(profileReward);
      profileRewardTemporaryStorageStub.get.withArgs(userId).resolves(1);

      // when
      const result = await getByQuestAndUserId({
        userId,
        quest,
        rewardApi: rewardApiStub,
        profileRewardApi: profileRewardApiStub,
        profileRewardTemporaryStorage: profileRewardTemporaryStorageStub,
      });

      // then
      expect(result).to.be.an.instanceof(QuestResult);
      expect(result.id).to.equal(quest.id);
      expect(result.reward).to.equal(reward);
      expect(result.profileRewardId).to.be.null;
      expect(result.obtained).to.be.null;
    });
  });
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
