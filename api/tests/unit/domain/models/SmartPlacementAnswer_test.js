const { expect, factory } = require('../../../test-helper');
const SmartPlacementAnswer = require('../../../../lib/domain/models/SmartPlacementAnswer');

describe('Unit | Domain | Models | SmartPlacementAnswer', () => {

  describe('#isCorrect', () => {

    it('should be true if result is OK', () => {
      // given
      const answer = factory.buildSmartPlacementAnswer({
        result: SmartPlacementAnswer.ResultType.OK,
      });

      // when
      const isCorrect = answer.isCorrect;

      // then
      expect(isCorrect).to.be.true;
    });

    it('should be false if result is not OK', () => {
      // given
      const answer = factory.buildSmartPlacementAnswer({
        result: SmartPlacementAnswer.ResultType.KO,
      });

      // when
      const isCorrect = answer.isCorrect;

      // then
      expect(isCorrect).to.be.false;
    });
  });
});
