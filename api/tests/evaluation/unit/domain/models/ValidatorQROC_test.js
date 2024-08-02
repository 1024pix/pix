import { ValidatorQROC } from '../../../../../src/evaluation/domain/models/ValidatorQROC.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Validation } from '../../../../../src/shared/domain/models/Validation.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Models | ValidatorQROC', function () {
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
    let solution;
    let challengeFormat;

    beforeEach(function () {
      // given
      solution = domainBuilder.buildSolution({ type: 'QROC' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROC({ solution: solution }, solutionServiceQROCStub);

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROC', function () {
      // then
      expect(solutionServiceQROCStub.match).to.have.been.calledWithExactly({
        answer: uncorrectedAnswer.value,
        solution: solution,
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
