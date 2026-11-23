import { expect } from 'chai';

import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithmConfiguration', function () {
  context('class invariants', function () {
    const params = {
      maximumAssessmentLength: 30,
      challengesBetweenSameCompetence: 2,
      limitToOneQuestionPerTube: false,
      enablePassageByAllCompetences: false,
      variationPercent: 0.2,
      defaultCandidateCapacity: -3,
      defaultProbabilityToPickChallenge: 100,
      questionNumberToPickFromSkillList: null,
    };

    context('maximumAssessmentLength', function () {
      it('should throw an EntityValidationError if it is missing', function () {
        // given
        delete params.maximumAssessmentLength;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is null', function () {
        // given
        params.maximumAssessmentLength = null;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is not an integer', function () {
        // given
        params.maximumAssessmentLength = 1.5;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is less than 0', function () {
        // given
        params.maximumAssessmentLength = -1;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
    });

    context('challengesBetweenSameCompetence', function () {
      it('should throw an EntityValidationError if it is missing', function () {
        // given
        delete params.challengesBetweenSameCompetence;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is not an integer', function () {
        // given
        params.challengesBetweenSameCompetence = 1.5;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is less than 0', function () {
        // given
        params.challengesBetweenSameCompetence = -1;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
    });

    context('limitToOneQuestionPerTube', function () {
      it('should throw an EntityValidationError if it is missing', function () {
        // given
        delete params.limitToOneQuestionPerTube;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
      it('should throw an EntityValidationError if it is not a boolean', function () {
        // given
        params.limitToOneQuestionPerTube = 'string';

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
    });

    context('enablePassageByAllCompetences', function () {
      it('should throw an EntityValidationError if it is missing', function () {
        // given
        delete params.enablePassageByAllCompetences;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
      it('should throw an EntityValidationError if it is not a boolean', function () {
        // given
        params.enablePassageByAllCompetences = 'string';

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
    });

    context('variationPercent', function () {
      it('should throw an EntityValidationError if it is not a number', function () {
        // given
        params.variationPercent = 'not a number';

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is less than 0', function () {
        // given
        params.variationPercent = -0.1;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is greater than 1', function () {
        // given
        params.variationPercent = 1.1;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
    });

    context('defaultCandidateCapacity', function () {
      it('should throw an EntityValidationError if it is missing', function () {
        // given
        delete params.defaultCandidateCapacity;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is not a number', function () {
        // given
        params.defaultCandidateCapacity = 'not a number';

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
    });

    context('defaultProbabilityToPickChallenge', function () {
      it('should throw an EntityValidationError if it is missing', function () {
        // given
        delete params.defaultProbabilityToPickChallenge;

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if it is not a number', function () {
        // given
        params.defaultProbabilityToPickChallenge = 'not a number';

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
    });

    context('questionNumberToPickFromSkillList', function () {
      it('should throw an EntityValidationError if it is not an array of number', function () {
        // given
        params.questionNumberToPickFromSkillList = 'not a number';

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });

      it('should throw an EntityValidationError if array contains negative numbers', function () {
        // given
        params.questionNumberToPickFromSkillList = [-1, 0, 1];

        // when
        const err = catchErrSync(() => new FlashAssessmentAlgorithmConfiguration(params))();

        // then
        expect(err).to.be.an.instanceOf(EntityValidationError);
      });
    });

    context('early stop (R4)', function () {
      const validParams = {
        maximumAssessmentLength: 32,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.5,
        defaultCandidateCapacity: -3,
        defaultProbabilityToPickChallenge: 51,
      };
      const earlyStopParams = {
        earlyStopConsecutiveFailures: 3,
        earlyStopMinimumLength: 8,
        earlyStopCapacityThreshold: -4.67,
        earlyStopConfidence: 0.95,
      };

      it('should be disabled by default', function () {
        // when
        const configuration = new FlashAssessmentAlgorithmConfiguration(validParams);

        // then
        expect(configuration.isEarlyStopEnabled).to.be.false;
        expect(configuration.earlyStopConsecutiveFailures).to.be.null;
        expect(configuration.earlyStopMinimumLength).to.be.null;
        expect(configuration.earlyStopCapacityThreshold).to.be.null;
        expect(configuration.earlyStopConfidence).to.be.null;
      });

      it('should be enabled when all early stop parameters are provided', function () {
        // when
        const configuration = new FlashAssessmentAlgorithmConfiguration({ ...validParams, ...earlyStopParams });

        // then
        expect(configuration.isEarlyStopEnabled).to.be.true;
      });

      ['earlyStopMinimumLength', 'earlyStopCapacityThreshold', 'earlyStopConfidence'].forEach((parameter) => {
        it(`should throw an EntityValidationError if ${parameter} is missing while early stop is enabled`, function () {
          // when
          const err = catchErrSync(
            () => new FlashAssessmentAlgorithmConfiguration({ ...validParams, ...earlyStopParams, [parameter]: null }),
          )();

          // then
          expect(err).to.be.an.instanceOf(EntityValidationError);
        });
      });

      [
        { parameter: 'earlyStopConsecutiveFailures', value: 0 },
        { parameter: 'earlyStopConsecutiveFailures', value: 1.5 },
        { parameter: 'earlyStopMinimumLength', value: -1 },
        { parameter: 'earlyStopCapacityThreshold', value: 'not a number' },
        { parameter: 'earlyStopConfidence', value: 0 },
        { parameter: 'earlyStopConfidence', value: 1 },
      ].forEach(({ parameter, value }) => {
        it(`should throw an EntityValidationError if ${parameter} is ${value}`, function () {
          // when
          const err = catchErrSync(
            () => new FlashAssessmentAlgorithmConfiguration({ ...validParams, ...earlyStopParams, [parameter]: value }),
          )();

          // then
          expect(err).to.be.an.instanceOf(EntityValidationError);
        });
      });
    });
  });
});
