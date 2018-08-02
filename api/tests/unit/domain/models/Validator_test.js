const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Validator = require('../../../../lib/domain/models/Validator');
const Validation = require('../../../../lib/domain/models/Validation');

const { expect, factory } = require('../../../test-helper');

describe('Unit | Domain | Models | Validator', () => {

  describe('#assess', () => {

    let uncorrectedAnswer;
    let validation;
    let validator;

    beforeEach(() => {
      // given
      uncorrectedAnswer = factory.buildAnswer.uncorrected();
      validator = new Validator();

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should return a validation object with Unimplemented status', () => {
      const expectedValidation = factory.buildValidation({
        result: AnswerStatus.UNIMPLEMENTED,
        resultDetails: null,
      });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
