const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQROCMInd = require('../../../../lib/domain/models/ValidatorQROCMInd');

const { expect, domainBuilder, sinon } = require('../../../test-helper');

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
      expect(solutionServiceQROCMIndStub.match).to.have.been.calledWith({
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
