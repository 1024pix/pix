import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Evaluation | Unit | Domain | Models | SmartRandomChallenge', function () {
  const baseData = {
    id: 'challengeId00',
    locales: ['fr'],
    status: domainBuilder.learningContent.buildChallenge.STATUSES.ARCHIVED,
    skillId: 'skillId00',
    timer: 123,
  };

  describe('#isTimed', function () {
    context('when there is no timer', function () {
      it('returns false', function () {
        const smartRandomChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({
          ...baseData,
          timer: null,
        });

        expect(smartRandomChallenge.isTimed()).to.be.false;
      });
    });

    context('when there is a timer', function () {
      it('returns true', function () {
        const smartRandomChallenge = domainBuilder.evaluation.buildSmartRandomChallenge({
          ...baseData,
          timer: 123,
        });

        expect(smartRandomChallenge.isTimed()).to.be.true;
      });
    });
  });
});
