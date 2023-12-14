import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';
import { Validation } from '../../../../../../src/devcomp/domain/models/validator/Validation.js';
import { ValidatorQROCMInd } from '../../../../../../src/devcomp/domain/models/validator/ValidatorQROCMInd.js';
import { expect, domainBuilder, sinon } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | ValidatorQROCMInd', function () {
  describe('#assess', function () {
    it('should call solutionServiceQROCMInd', function () {
      // given
      const solutionServiceQROCMIndStub = {
        match: sinon.stub(),
      };
      solutionServiceQROCMIndStub.match.returns({ result: AnswerStatus.OK, resultDetails: 'resultDetails' });

      const solution = domainBuilder.buildSolution({ type: 'QROCM-ind' });
      const uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      const validator = new ValidatorQROCMInd({
        solution: solution,
        dependencies: { solutionServiceQROCMInd: solutionServiceQROCMIndStub },
      });

      // when
      validator.assess({ answer: uncorrectedAnswer });

      // then
      expect(solutionServiceQROCMIndStub.match).to.have.been.calledWithExactly({
        answerValue: uncorrectedAnswer.value,
        solution: solution,
      });
    });
    it('should return a validation object with the returned status', function () {
      // given
      const expectedValidation = domainBuilder.buildValidation({
        result: AnswerStatus.OK,
        resultDetails: 'resultDetails',
      });
      const solutionServiceQROCMIndStub = {
        match: sinon.stub(),
      };
      solutionServiceQROCMIndStub.match.returns({ result: AnswerStatus.OK, resultDetails: 'resultDetails' });

      const solution = domainBuilder.buildSolution({ type: 'QROCM-ind' });
      const uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      const validator = new ValidatorQROCMInd({
        solution: solution,
        dependencies: { solutionServiceQROCMInd: solutionServiceQROCMIndStub },
      });

      // when
      const validation = validator.assess({ answer: uncorrectedAnswer });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
