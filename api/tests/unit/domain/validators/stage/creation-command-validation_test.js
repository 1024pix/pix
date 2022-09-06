const { expect } = require('../../../../test-helper');
const creationCommandValidator = require('../../../../../lib/domain/validators/stage/creation-command-validation');
const { EntityValidationError } = require('../../../../../lib/domain/errors');

describe('Unit | Domain | Validators | stage/creationCommandValidator', function () {
  describe('#validate', function () {
    let validParamsWithLevel;
    let validParamsWithThreshold;

    beforeEach(function () {
      validParamsWithLevel = {
        title: 'Mon palier',
        message: 'Mon message',
        level: 5,
        threshold: null,
        targetProfileId: 1,
      };
      validParamsWithThreshold = {
        title: 'Mon palier',
        message: 'Mon message',
        level: null,
        threshold: 25,
        targetProfileId: 1,
      };
    });

    context('when command validation is successful', function () {
      it('should not throw any error, level style', function () {
        // given
        const stageCreationCommand = validParamsWithLevel;

        // when/then
        expect(creationCommandValidator.validate(stageCreationCommand)).to.not.throw;
      });

      it('should not throw any error, threshold style', function () {
        // given
        const stageCreationCommand = validParamsWithThreshold;

        // when/then
        expect(creationCommandValidator.validate(stageCreationCommand)).to.not.throw;
      });
    });

    context('when command validation fails', function () {
      it('should reject when title is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParamsWithLevel,
          title: 123,
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when message is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParamsWithLevel,
          message: { a: 'bidule' },
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when level and threshold are both empty', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParamsWithLevel,
          level: null,
          threshold: null,
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when level and threshold both have a value', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParamsWithLevel,
          level: 456,
          threshold: 789,
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });

      it('should reject when targetProfileId is not valid', function () {
        // given
        const targetProfileCreationCommand = {
          ...validParamsWithLevel,
          targetProfileId: 'coucou',
        };

        try {
          // when
          creationCommandValidator.validate(targetProfileCreationCommand);
          expect.fail('should have thrown an error');
        } catch (err) {
          // then
          expect(err).to.be.instanceOf(EntityValidationError);
        }
      });
    });
  });
});
