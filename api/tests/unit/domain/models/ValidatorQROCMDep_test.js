import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';
import solutionServiceQrocmDep from '../../../../lib/domain/services/solution-service-qrocm-dep';
import Validation from '../../../../lib/domain/models/Validation';
import ValidatorQROCMDep from '../../../../lib/domain/models/ValidatorQROCMDep';
import { expect, domainBuilder, sinon } from '../../../test-helper';

describe('Unit | Domain | Models | ValidatorQROCMDep', function () {
  beforeEach(function () {
    sinon.stub(solutionServiceQrocmDep, 'match');
  });

  describe('#assess', function () {
    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(function () {
      // given
      solutionServiceQrocmDep.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({
        type: 'QROCM-dep',
        value: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        isT1Enabled: true,
        isT2Enabled: true,
        isT3Enabled: true,
        scoring: '1: acquix\n2: acquix',
      });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROCMDep({ solution: solution });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROCMDep', function () {
      // then
      expect(solutionServiceQrocmDep.match).to.have.been.calledWith({ answerValue: uncorrectedAnswer.value, solution });
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
