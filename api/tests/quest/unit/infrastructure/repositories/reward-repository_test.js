import { QuestResult } from '../../../../../src/quest/domain/models/QuestResult.js';
import { getByQuestAndUserId } from '../../../../../src/quest/infrastructure/repositories/reward-repository.js';
import { expect, sinon } from '../../../../test-helper.js';

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
      reward = Symbol('reward');
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
});
