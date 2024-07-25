import { AnswerStatus } from '../../../../../../src/devcomp/domain/models/validator/AnswerStatus.js';
import { Validation } from '../../../../../../src/devcomp/domain/models/validator/Validation.js';
import { ValidatorEmbed } from '../../../../../../src/devcomp/domain/models/validator/ValidatorEmbed.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import * as devcompDomainBuilder from '../../../../tooling/domain-builder/factory/index.js';

describe('Unit | Devcomp | Domain | Models | Validator | ValidatorQCU', function () {
  let solutionServiceEmbedStub;

  beforeEach(function () {
    solutionServiceEmbedStub = {
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
      solutionServiceEmbedStub.match.returns(AnswerStatus.OK);
      solution = devcompDomainBuilder.buildSolution({ type: 'embed' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorEmbed({
        solution: solution,
        dependencies: { solutionServiceEmbed: solutionServiceEmbedStub },
      });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceEmbed', function () {
      // then
      expect(solutionServiceEmbedStub.match).to.have.been.calledWithExactly(uncorrectedAnswer.value, solution.value);
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
