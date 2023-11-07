import { FlashAssessmentSuccessRateHandler } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentSuccessRateHandler.js';
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

      flashAssessmentSuccessRateHandler = FlashAssessmentSuccessRateHandler.createFixed(fixedConfig);
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

        flashAssessmentSuccessRateHandler = FlashAssessmentSuccessRateHandler.createFixed(fixedConfig);
      });

      it('should return the fixed value', function () {
        const questionIndex = 5;
        const successRate = flashAssessmentSuccessRateHandler.getMinimalSuccessRate(questionIndex);

        expect(successRate).to.equal(configSuccessRate);
      });
    });

    describe('when strategy is linear', function () {
      let flashAssessmentSuccessRateHandler;
      beforeEach(function () {
        const linearConfig = {
          startingChallengeIndex: 0,
          endingChallengeIndex: 4,
          startingValue: 0.8,
          endingValue: 0.6,
        };

        flashAssessmentSuccessRateHandler = FlashAssessmentSuccessRateHandler.createLinear(linearConfig);
      });

      it('should return the computed linear value', function () {
        const questionIndex = 2;
        const successRate = flashAssessmentSuccessRateHandler.getMinimalSuccessRate(questionIndex);

        expect(successRate).to.equal(0.7);
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

    describe('when type is linear', function () {
      it('should return the linear value', function () {
        const linearConfig = {
          type: 'linear',
          startingChallengeIndex: 0,
          endingChallengeIndex: 2,
          startingValue: 0.8,
          endingValue: 0.6,
        };

        const flashAssessmentSuccessRateHandler = FlashAssessmentSuccessRateHandler.create(linearConfig);

        const questionIndex = 1;
        const successRate = flashAssessmentSuccessRateHandler.getMinimalSuccessRate(questionIndex);

        expect(successRate).to.equal(0.7);
      });
    });
  });
});
