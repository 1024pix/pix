const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const solutionServiceQrocmDep = require('../../../../lib/domain/services/solution-service-qrocm-dep');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQROCMDep = require('../../../../lib/domain/models/ValidatorQROCMDep');

const { expect, factory, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | ValidatorQROCMDep', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(solutionServiceQrocmDep, 'match');
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
      solutionServiceQrocmDep.match.returns(AnswerStatus.OK);
      solution = factory.buildSolution({ type: 'QROCM-ind' });

      uncorrectedAnswer = factory.buildAnswer.uncorrected();
      validator = new ValidatorQROCMDep({ solution: solution });

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should call solutionServiceQROCMInd', () => {
      // then
      expect(solutionServiceQrocmDep.match).to.have.been.calledWith(
        uncorrectedAnswer.value, solution.value, solution.deactivations);
    });
    it('should return a validation object with the returned status', () => {
      const expectedValidation = factory.buildValidation({
        result: AnswerStatus.OK,
        resultDetails: null,
      });

      // then
      expect(validation).to.be.an.instanceOf(Validation);
      expect(validation).to.deep.equal(expectedValidation);
    });
  });
});
