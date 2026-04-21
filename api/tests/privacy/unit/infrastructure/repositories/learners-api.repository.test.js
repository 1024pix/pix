import sinon from 'sinon';

import {
  anonymizeByUserId,
  hasBeenLearner,
} from '../../../../../src/privacy/infrastructure/repositories/learners-api.repository.js';

describe('Unit | Privacy | Infrastructure | Repositories | learners-api', function () {
  describe('#hasBeenLearner', function () {
    it('indicates if user has been a learner', async function () {
      // given
      const dependencies = {
        learnersApi: {
          hasBeenLearner: async () => true,
        },
      };

      // when
      const result = await hasBeenLearner({ userId: '123', dependencies });

      // then
      expect(result).to.be.true;
    });
  });

  describe('#anonymizeByUserId', function () {
    it('anonymize learners and theirs participations attached to a userId', async function () {
      // given
      const dependencies = {
        learnersApi: {
          anonymizeByUserId: sinon.stub(),
        },
      };
      // when
      await anonymizeByUserId({ userId: 123, dependencies });
      // then
      expect(dependencies.learnersApi.anonymizeByUserId).calledOnceWithExactly({ userId: 123 });
    });
  });
});
