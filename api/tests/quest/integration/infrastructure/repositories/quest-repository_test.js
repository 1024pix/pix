import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { Quest } from '../../../../../src/quest/domain/models/Quest.js';
import * as questRepository from '../../../../../src/quest/infrastructure/repositories/quest-repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Quest | Integration | Repository | quest', function () {
  describe('#findAll', function () {
    it('should return all quests', async function () {
      // given
      databaseBuilder.factory.buildQuest({
        id: 1,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: { toto: 'tata' },
        successRequirements: { titi: 'tutu' },
      });
      databaseBuilder.factory.buildQuest({
        id: 2,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: { toto: 'tata' },
        successRequirements: { titi: 'tutu' },
      });
      databaseBuilder.factory.buildQuest({
        id: 3,
        rewardType: REWARD_TYPES.ATTESTATION,
        rewardId: 2,
        eligibilityRequirements: { toto: 'tata' },
        successRequirements: { titi: 'tutu' },
      });
      await databaseBuilder.commit();

      // when
      const quests = await questRepository.findAll();

      // then
      expect(quests[0]).to.be.an.instanceof(Quest);
      expect(quests.length).to.equal(3);
    });
  });
});
