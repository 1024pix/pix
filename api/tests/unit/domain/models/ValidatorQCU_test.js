import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';
import { Validation } from '../../../../src/shared/domain/models/Validation.js';
import { ValidatorQCU } from '../../../../src/shared/domain/models/ValidatorQCU.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Models | ValidatorQCU', function () {
  let solutionServiceQCUStub;

  beforeEach(function () {
    solutionServiceQCUStub = {
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
      solutionServiceQCUStub.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({ type: 'QCU' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQCU({
        solution: solution,
        dependencies: { solutionServiceQCU: solutionServiceQCUStub },
      });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQCU', function () {
      // then
      expect(solutionServiceQCUStub.match).to.have.been.calledWithExactly(uncorrectedAnswer.value, solution.value);
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
