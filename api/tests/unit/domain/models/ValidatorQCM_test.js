const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const solutionServiceQcm = require('../../../../lib/domain/services/solution-service-qcm');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQCM = require('../../../../lib/domain/models/ValidatorQCM');

const { expect, domainBuilder, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | ValidatorQCM', function() {

  beforeEach(function() {

    sinon.stub(solutionServiceQcm, 'match');
  });

  describe('#assess', function() {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(function() {
      // given
      solutionServiceQcm.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({ type: 'QCM' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQCM({ solution: solution });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQCU', function() {
      // then
      expect(solutionServiceQcm.match).to.have.been.calledWith(uncorrectedAnswer.value, solution.value);
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
