import sinon from 'sinon';

import { AnswerJobRepository } from '../../../../../src/evaluation/infrastructure/repositories/answer-job-repository.js';
import { config } from '../../../../../src/shared/config.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { temporaryStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';

const profileRewardTemporaryStorage = temporaryStorage.withPrefix('profile-rewards:');

describe('Evaluation | Integration | Infrastructure | Repositories | AnswerJobRepository', function () {
  beforeEach(async function () {
    await profileRewardTemporaryStorage.flushAll();
    sinon.stub(config, 'featureToggles');
    await featureToggles.set('isQuestEnabled', true);
    await featureToggles.set('isAsyncQuestRewardingCalculationEnabled', true);
  });

  describe('#performAsync', function () {
    it('should do nothing if quests are disabled', async function () {
      // given
      await featureToggles.set('isQuestEnabled', false);
      const userId = '123';
      const answerJobRepository = new AnswerJobRepository();

      // when
      await answerJobRepository.performAsync({ userId });

      // then
      const counter = await profileRewardTemporaryStorage.get(userId);
      expect(counter).to.be.null;
    });

    it('should do nothing if quests are in sync mode', async function () {
      // given
      await featureToggles.set('isAsyncQuestRewardingCalculationEnabled', false);
      const userId = '123';
      const answerJobRepository = new AnswerJobRepository();

      // when
      await answerJobRepository.performAsync({ userId });

      // then
      const counter = await profileRewardTemporaryStorage.get(userId);
      expect(counter).to.be.null;
    });

    it("should increment user's jobs count in temporary storage", async function () {
      // given
      const userId = '123';
      const answerJobRepository = new AnswerJobRepository();

      // when
      await answerJobRepository.performAsync({ userId });

      // then
      const counter = await profileRewardTemporaryStorage.get(userId);
      expect(counter).to.equal(1);
    });
  });
});
