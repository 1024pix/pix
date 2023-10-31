import { AnswerStatus } from '../../../../lib/domain/models/AnswerStatus.js';
import { Validation } from '../../../../lib/domain/models/Validation.js';
import { ValidatorQROCMDep } from '../../../../lib/domain/models/ValidatorQROCMDep.js';
import { expect, domainBuilder, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Models | ValidatorQROCMDep', function () {
  let solutionServiceQROCMDepStub;

  beforeEach(function () {
    solutionServiceQROCMDepStub = {
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
      solutionServiceQROCMDepStub.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({
        type: 'QROCM-dep',
        value: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        isT1Enabled: true,
        isT2Enabled: true,
        isT3Enabled: true,
      });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROCMDep({
        solution: solution,
        dependencies: { solutionServiceQROCMDep: solutionServiceQROCMDepStub },
      });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROCMDep', function () {
      // then
      expect(solutionServiceQROCMDepStub.match).to.have.been.calledWithExactly({
        answerValue: uncorrectedAnswer.value,
        solution,
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
