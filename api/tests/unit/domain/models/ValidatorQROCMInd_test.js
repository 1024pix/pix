const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const solutionServiceQrocmInd = require('../../../../lib/domain/services/solution-service-qrocm-ind');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQROCMInd = require('../../../../lib/domain/models/ValidatorQROCMInd');

const { expect, factory, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | ValidatorQROCMInd', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(solutionServiceQrocmInd, 'match');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#assess', () => {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(() => {
      // given
      solutionServiceQrocmInd.match.returns({ result: AnswerStatus.OK, resultDetails: 'resultDetailYAMLString' });
      solution = factory.buildSolution({ type: 'QROCM-ind' });

      uncorrectedAnswer = factory.buildAnswer.uncorrected();
      validator = new ValidatorQROCMInd({ solution: solution });

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should call solutionServiceQROCMInd', () => {
      // then
      expect(solutionServiceQrocmInd.match).to.have.been.calledWith(
        uncorrectedAnswer.value, solution.value, solution.enabledTreatments);
    });
    it('should return a validation object with the returned status', () => {
      const expectedValidation = factory.buildValidation({
        result: AnswerStatus.OK,
        resultDetails: 'resultDetailYAMLString',
      });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
