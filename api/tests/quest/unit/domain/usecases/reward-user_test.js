import sinon from 'sinon';

import { rewardUser } from '../../../../../src/quest/domain/usecases/reward-user.js';

describe('Quest | Unit | Domain | Usecases | RewardUser', function () {
  let userId;
  let questRepository;
  let eligibilityRepository;
  let successRepository;
  let rewardRepository;

  let dependencies;
  let logger;

  beforeEach(function () {
    userId = 1;

    questRepository = {
      findAllWithReward: sinon.stub(),
    };

    logger = {
      error: sinon.stub(),
    };

    eligibilityRepository = {
      find: sinon.stub(),
    };

    successRepository = { find: sinon.stub() };

    rewardRepository = { save: sinon.stub(), getByUserId: sinon.stub() };

    dependencies = {
      questRepository,
      eligibilityRepository,
      successRepository,
      rewardRepository,
      logger,
    };
  });

  context('when there are no quests available', function () {
    it('should not call eligibility repository', async function () {
      // given
      questRepository.findAllWithReward.resolves([]);

      // when
      await rewardUser({ userId, ...dependencies });
      expect(eligibilityRepository.find).to.not.have.been.called;
    });
  });

  context('when user id is not provided', function () {
    it('should not call eligibility repository', async function () {
      // given
      const quest = { isEligible: () => false };
      questRepository.findAllWithReward.resolves([quest]);
      rewardRepository.getByUserId.resolves([]);
      eligibilityRepository.find.resolves([]);

      // when
      await rewardUser({ userId: null, ...dependencies });
      expect(eligibilityRepository.find).to.not.have.been.called;
    });
  });

  context('when the user is not eligible', function () {
    it('should not call success repository', async function () {
      // given
      const quest = { isEligible: () => false };
      questRepository.findAllWithReward.resolves([quest]);
      eligibilityRepository.find.resolves([Symbol('eligibility')]);
      rewardRepository.getByUserId.resolves([]);

      // when
      await rewardUser({
        userId,
        ...dependencies,
      });
      expect(successRepository.find).to.not.have.been.called;
    });
  });

  context('when the user is eligible but has not succeeded the quest', function () {
    it('should not call profile reward repository', async function () {
      // given
      const quest = {
        isEligible: () => true,
        isSuccessful: () => false,
        rewardId: 1,
      };
      questRepository.findAllWithReward.resolves([quest]);
      eligibilityRepository.find.resolves([Symbol('eligibility')]);
      successRepository.find.resolves([Symbol('success')]);
      rewardRepository.getByUserId.resolves([]);

      // when
      await rewardUser({
        userId,
        ...dependencies,
      });

      // then
      expect(rewardRepository.save).to.have.not.been.called;
    });
  });

  context('when the user is eligible but already got the reward', function () {
    it('should not call success repository', async function () {
      // given
      const questRewardId = Symbol('questRewardId');
      const quest = { isEligible: () => true, rewardId: questRewardId };
      questRepository.findAllWithReward.resolves([quest]);
      eligibilityRepository.find.resolves([Symbol('eligibility')]);
      rewardRepository.getByUserId.resolves([
        {
          rewardId: questRewardId,
        },
      ]);

      // when
      await rewardUser({
        userId,
        ...dependencies,
      });
      expect(successRepository.find).to.not.have.been.called;
    });
  });

  it('ensure that quest system does not throw error', async function () {
    const error = new Error('my error');
    dependencies.questRepository.findAllWithReward.throws(error);

    await rewardUser({
      userId,
      ...dependencies,
    });

    expect(logger.error).have.been.calledWithExactly({ event: 'quest-reward', err: error }, 'Error on quests');
  });
});
