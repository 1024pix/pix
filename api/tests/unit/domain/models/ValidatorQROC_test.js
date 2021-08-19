const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const solutionServiceQroc = require('../../../../lib/domain/services/solution-service-qroc');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQROC = require('../../../../lib/domain/models/ValidatorQROC');

const { expect, domainBuilder, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | ValidatorQROC', function() {

  beforeEach(function() {

    sinon.stub(solutionServiceQroc, 'match');
  });

  describe('#assess', function() {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;
    let challengeFormat;

    beforeEach(function() {
      // given
      solutionServiceQroc.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({ type: 'QROC' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQROC({ solution: solution });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQROC', function() {
      // then
      expect(solutionServiceQroc.match).to.have.been.calledWith({
        answer: uncorrectedAnswer.value,
        solution: solution.value,
        deactivations: solution.deactivations,
        challengeFormat,
      });
    });
    it('should return a validation object with the returned status', function() {
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
