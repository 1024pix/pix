const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const solutionServiceQrocmDep = require('../../../../lib/domain/services/solution-service-qrocm-dep');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQROCMDep = require('../../../../lib/domain/models/ValidatorQROCMDep');

const { expect, domainBuilder, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | ValidatorQROCMDep', function() {

  beforeEach(function() {

    sinon.stub(solutionServiceQrocmDep, 'match');
  });

  describe('#assess', function() {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(function() {
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

    it('should call solutionServiceQROCMDep', function() {
      // then
      expect(solutionServiceQrocmDep.match).to.have.been.calledWith(
        uncorrectedAnswer.value, solution.value, solution.scoring, solution.deactivations);
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
