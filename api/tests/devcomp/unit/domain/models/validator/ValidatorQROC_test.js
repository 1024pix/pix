import { AnswerStatus } from '../../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import { Validation } from '../../../../../../src/devcomp/domain/models/validator/Validation.js';
import { ValidatorQROC } from '../../../../../../src/devcomp/domain/models/validator/ValidatorQROC.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Validator | ValidatorQROC', function () {
  let solutionServiceQROCStub;
  beforeEach(function () {
    solutionServiceQROCStub = {
      match: sinon.stub().returns(AnswerStatus.OK),
    };
  });

  describe('#assess', function () {
    let uncorrectedAnswer;
    let validation;
    let validator;
    let solutions;
    let challengeFormat;

    beforeEach(function () {
      // given
      solutions = domainBuilder.buildSolution({ type: 'QROC', value: ['1'] });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROC({ solutions }, solutionServiceQROCStub);

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROC', function () {
      // then
      expect(solutionServiceQROCStub.match).to.have.been.calledWithExactly({
        answer: uncorrectedAnswer.value,
        solutions,
        challengeFormat,
      });
    });
    it('should return a validation object with the returned status', function () {
      const expectedValidation = domainBuilder.buildValidation({
        result: AnswerStatus.OK,
        resultDetails: null,
      });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
