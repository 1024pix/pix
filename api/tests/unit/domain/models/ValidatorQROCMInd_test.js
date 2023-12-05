import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';
import { Validation } from '../../../../lib/domain/models/Validation.js';
import { ValidatorQROCMInd } from '../../../../lib/domain/models/ValidatorQROCMInd.js';
import { expect, domainBuilder, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Models | ValidatorQROCMInd', function () {
  let solutionServiceQROCMIndStub;

  beforeEach(function () {
    solutionServiceQROCMIndStub = {
      match: sinon.stub(),
    };
  });

  describe('#assess', function () {
    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(function () {
      // given
      solutionServiceQROCMIndStub.match.returns({ result: AnswerStatus.OK, resultDetails: 'resultDetailYAMLString' });
      solution = domainBuilder.buildSolution({ type: 'QROCM-ind' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROCMInd({
        solution: solution,
        dependencies: { solutionServiceQROCMInd: solutionServiceQROCMIndStub },
      });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROCMInd', function () {
      // then
      expect(solutionServiceQROCMIndStub.match).to.have.been.calledWithExactly({
        answerValue: uncorrectedAnswer.value,
        solution: solution,
      });
    });
    it('should return a validation object with the returned status', function () {
      const expectedValidation = domainBuilder.buildValidation({
        result: AnswerStatus.OK,
        resultDetails: 'resultDetailYAMLString',
      });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
