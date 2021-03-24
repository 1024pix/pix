const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const solutionServiceQrocmInd = require('../../../../lib/domain/services/solution-service-qrocm-ind');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQROCMInd = require('../../../../lib/domain/models/ValidatorQROCMInd');

const { expect, domainBuilder, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | ValidatorQROCMInd', function() {

  beforeEach(function() {

    sinon.stub(solutionServiceQrocmInd, 'match');
  });

  describe('#assess', function() {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(function() {
      // given
      solutionServiceQrocmInd.match.returns({ result: AnswerStatus.OK, resultDetails: 'resultDetailYAMLString' });
      solution = domainBuilder.buildSolution({ type: 'QROCM-ind' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROCMInd({ solution: solution });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROCMInd', function() {
      // then
      expect(solutionServiceQrocmInd.match).to.have.been.calledWith(
        uncorrectedAnswer.value, solution.value, solution.enabledTreatments);
    });
    it('should return a validation object with the returned status', function() {
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
