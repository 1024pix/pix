import { FlashAssessmentSuccessRateHandler } from '../../../../../../src/certification/flash-certification/domain/models/FlashAssessmentSuccessRateHandler.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithmSuccessRateHandler', function () {
  describe('#isApplicable', function () {
    let flashAssessmentSuccessRateHandler;

    beforeEach(function () {
      const fixedConfig = {
        startingChallengeIndex: 0,
        endingChallengeIndex: 7,
        value: 0.8,
      };

      flashAssessmentSuccessRateHandler = FlashAssessmentSuccessRateHandler.create(fixedConfig);
    });

    describe('when currentIndex is inside the application range', function () {
      it('should return true', function () {
        const currentIndex = 5;

        const isApplicable = flashAssessmentSuccessRateHandler.isApplicable(currentIndex);

        expect(isApplicable).to.be.true;
      });
    });

    describe('when filter is outside the application range', function () {
      it('should return false', function () {
        const currentIndex = 8;

        const isApplicable = flashAssessmentSuccessRateHandler.isApplicable(currentIndex);

        expect(isApplicable).to.be.false;
      });
    });
  });

  describe('#getMinimalSuccessRate', function () {
    describe('when strategy is fixed', function () {
      let flashAssessmentSuccessRateHandler;
      const configSuccessRate = 0.8;

      beforeEach(function () {
        const fixedConfig = {
          startingChallengeIndex: 0,
          endingChallengeIndex: 7,
          value: configSuccessRate,
        };

        flashAssessmentSuccessRateHandler = FlashAssessmentSuccessRateHandler.create(fixedConfig);
      });

      it('should return the fixed value', function () {
        const questionIndex = 5;
        const successRate = flashAssessmentSuccessRateHandler.getMinimalSuccessRate(questionIndex);

        expect(successRate).to.equal(configSuccessRate);
      });
    });
  });

  describe('#create', function () {
    describe('when type is fixed', function () {
      it('should return the fixed value', function () {
        const configSuccessRate = 0.8;
        const fixedConfig = {
          type: 'fixed',
          startingChallengeIndex: 0,
          endingChallengeIndex: 7,
          value: configSuccessRate,
        };

        const flashAssessmentSuccessRateHandler = FlashAssessmentSuccessRateHandler.create(fixedConfig);

        const questionIndex = 5;
        const successRate = flashAssessmentSuccessRateHandler.getMinimalSuccessRate(questionIndex);

        expect(successRate).to.equal(configSuccessRate);
      });
    });
  });
});
