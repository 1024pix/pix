import { rewardUser } from '../../../../../src/quest/domain/usecases/reward-user.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Usecases | RewardUser', function () {
  let userId;
  let questRepository;
  let eligibilityRepository;
  let successRepository;
  let profileRewardRepository;

  beforeEach(function () {
    userId = 1;

    questRepository = {
      findAll: sinon.stub(),
    };

    eligibilityRepository = {
      find: sinon.stub(),
    };

    successRepository = { find: sinon.stub() };

    profileRewardRepository = { save: sinon.stub() };
  });

  context('when there are no quests available', function () {
    it('should not call eligibility repository', async function () {
      // given
      questRepository.findAll.resolves([]);

      // when
      await rewardUser({ userId, questRepository, eligibilityRepository });
      expect(eligibilityRepository.find).to.not.have.been.called;
    });
  });

  context('when the user is not eligible', function () {
    it('should not call success repository', async function () {
      // given
      const quest = { isEligible: () => false };
      questRepository.findAll.resolves([quest]);
      eligibilityRepository.find.resolves([Symbol('eligibility')]);

      // when
      await rewardUser({ userId, questRepository, eligibilityRepository, successRepository });
      expect(successRepository.find).to.not.have.been.called;
    });
  });

  context('when the user is eligible but has not succeeded the quest', function () {
    it('should not call profile reward repository', async function () {
      // given
      const quest = {
        isEligible: () => true,
        isSuccessful: () => false,
        successRequirements: [{ data: { ids: [Symbol('skillId')] } }],
        rewardId: 1,
      };
      questRepository.findAll.resolves([quest]);
      eligibilityRepository.find.resolves([Symbol('eligibility')]);
      successRepository.find.resolves([Symbol('success')]);

      // when
      await rewardUser({ userId, questRepository, eligibilityRepository, successRepository, profileRewardRepository });

      // then
      expect(profileRewardRepository.save).to.have.not.been.called;
    });
  });
});
