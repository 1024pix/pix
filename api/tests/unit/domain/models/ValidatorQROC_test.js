import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';
import solutionServiceQroc from '../../../../lib/domain/services/solution-service-qroc';
import Validation from '../../../../lib/domain/models/Validation';
import ValidatorQROC from '../../../../lib/domain/models/ValidatorQROC';
import { expect, domainBuilder, sinon } from '../../../test-helper';

describe('Unit | Domain | Models | ValidatorQROC', function () {
  beforeEach(function () {
    sinon.stub(solutionServiceQroc, 'match');
  });

  describe('#assess', function () {
    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;
    let challengeFormat;

    beforeEach(function () {
      // given
      solutionServiceQroc.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({ type: 'QROC' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROC({ solution: solution });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROC', function () {
      // then
      expect(solutionServiceQroc.match).to.have.been.calledWith({
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
