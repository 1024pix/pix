import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';
import solutionServiceQrocmInd from '../../../../lib/domain/services/solution-service-qrocm-ind';
import Validation from '../../../../lib/domain/models/Validation';
import ValidatorQROCMInd from '../../../../lib/domain/models/ValidatorQROCMInd';
import { expect, domainBuilder, sinon } from '../../../test-helper';

describe('Unit | Domain | Models | ValidatorQROCMInd', function () {
  beforeEach(function () {
    sinon.stub(solutionServiceQrocmInd, 'match');
  });

  describe('#assess', function () {
    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(function () {
      // given
      solutionServiceQrocmInd.match.returns({ result: AnswerStatus.OK, resultDetails: 'resultDetailYAMLString' });
      solution = domainBuilder.buildSolution({ type: 'QROCM-ind' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROCMInd({ solution: solution });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROCMInd', function () {
      // then
      expect(solutionServiceQrocmInd.match).to.have.been.calledWith({
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
