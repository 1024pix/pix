import { expect } from 'chai';

import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
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
  });

  describe('#areDifferent', function () {
    let baseData;
    beforeEach(function () {
      baseData = {
        maximumAssessmentLength: 1,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: true,
        variationPercent: 0.3,
        defaultCandidateCapacity: 4,
        defaultProbabilityToPickChallenge: 5,
      };
    });

    [
      { attr: 'maximumAssessmentLength', value: 10 },
      { attr: 'challengesBetweenSameCompetence', value: 10 },
      { attr: 'limitToOneQuestionPerTube', value: false },
      { attr: 'enablePassageByAllCompetences', value: false },
      { attr: 'variationPercent', value: 0.99 },
      { attr: 'defaultCandidateCapacity', value: 10 },
      { attr: 'defaultProbabilityToPickChallenge', value: 10 },
    ].forEach(({ attr, value }) => {
      it(`returns true when "${attr}" has a different value`, function () {
        const flashAssessmentConfig = domainBuilder.buildFlashAlgorithmConfiguration(baseData);

        const areDifferent = flashAssessmentConfig.areDifferent({
          ...baseData,
          [attr]: value,
        });

        expect(areDifferent).to.be.true;
      });
    });

    it('returns false when all attributes are the same as the model', function () {
      const flashAssessmentConfig = domainBuilder.buildFlashAlgorithmConfiguration(baseData);

      const areDifferent = flashAssessmentConfig.areDifferent(baseData);

      expect(areDifferent).to.be.false;
    });
  });
});
