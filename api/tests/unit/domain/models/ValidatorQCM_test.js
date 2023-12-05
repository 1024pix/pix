import { AnswerStatus } from '../../../../src/shared/domain/models/AnswerStatus.js';
import { Validation } from '../../../../lib/domain/models/Validation.js';
import { ValidatorQCM } from '../../../../lib/domain/models/ValidatorQCM.js';
import { expect, domainBuilder, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Models | ValidatorQCM', function () {
  let solutionServiceQcmStub;
  beforeEach(function () {
    solutionServiceQcmStub = {
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
      solutionServiceQcmStub.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({ type: 'QCM' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQCM({
        solution: solution,
        dependencies: { solutionServiceQCM: solutionServiceQcmStub },
      });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQCU', function () {
      // then
      expect(solutionServiceQcmStub.match).to.have.been.calledWithExactly(uncorrectedAnswer.value, solution.value);
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
