/* eslint-disable mocha/no-identical-title */
const { expect } = require('../../../test-helper');

const Stage = require('../../../../lib/domain/models/Stage');
const { EntityValidationError } = require('../../../../lib/domain/errors');

const stageValidator = require('../../../../lib/domain/validators/stage-validator');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | stage-validator', () => {
  describe('#validate', () => {
    let stage;

    beforeEach(() => {
      stage = new Stage({
        title: 'My title',
        threshold: 42,
        targetProfileId: 3,
      });
    });

    context('when validation is successful ', () => {
      it('should not throw any error', () => {
        expect(stageValidator.validate({ stage })).to.be.true;
      });
    });

    context('when stage data validation fails', () => {
      it('should reject with error when title is missing', () => {
        // given
        const expectedError = {
          attribute: 'title',
          message: 'STAGE_TITLE_IS_REQUIRED',
        };
        stage.title = MISSING_VALUE;

        // when
        try {
          stageValidator.validate({ stage });
          expect.fail('should have thrown an error');
        } catch (errors) {
          // then
          _assertErrorMatchesWithExpectedOne(errors, expectedError);
        }
      });

      it('should reject with error when threshold is missing', () => {
        // given
        const expectedError = {
          attribute: 'threshold',
          message: 'STAGE_THRESHOLD_IS_REQUIRED',
        };
        stage.threshold = MISSING_VALUE;

        // when
        try {
          stageValidator.validate({ stage });
          expect.fail('should have thrown an error');
        } catch (errors) {
          // then
          _assertErrorMatchesWithExpectedOne(errors, expectedError);
        }
      });

      it('should reject with error when targetProfileId is missing', () => {
        // given
        const expectedError = {
          attribute: 'targetProfileId',
          message: 'TARGET_PROFILE_IS_REQUIRED',
        };
        stage.targetProfileId = MISSING_VALUE;

        // when
        try {
          stageValidator.validate({ stage });
          expect.fail('should have thrown an error');

        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });
    });
  });
});
