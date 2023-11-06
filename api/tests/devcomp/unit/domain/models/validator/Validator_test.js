import { AnswerStatus } from '../../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import { Validator } from '../../../../../../src/devcomp/domain/models/validator/Validator.js';
import { Validation } from '../../../../../../src/devcomp/domain/models/validator/Validation.js';
import { expect, domainBuilder } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Validator', function () {
  describe('#assess', function () {
    let uncorrectedAnswer;
    let validation;
    let validator;

    beforeEach(function () {
      // given
      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new Validator();

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should return a validation object with Unimplemented status', function () {
      const expectedValidation = domainBuilder.buildValidation({
        result: AnswerStatus.UNIMPLEMENTED,
        resultDetails: null,
      });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
