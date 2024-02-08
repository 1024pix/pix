import { ValidatorQCM } from '../../../../../../src/devcomp/domain/models/validator/ValidatorQCM.js';
import { Validation } from '../../../../../../src/devcomp/domain/models/validator/Validation.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import * as devcompDomainBuilder from '../../../../tooling/domain-builder/factory/index.js';

describe('Unit | Devcomp | Domain | Models | Validator | ValidatorQCM', function () {
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
      solution = devcompDomainBuilder.buildSolution({ type: 'QCM' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQCM({
        solution: solution,
        dependencies: { solutionServiceQCM: solutionServiceQcmStub },
      });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQCM', function () {
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
