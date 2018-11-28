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
      solution = factory.buildSolution({
        type: 'QROCM-dep',
        value: 'Google:\n- abcd\n- efgh\n- hijk\nYahoo:\n- lmno\n- pqrs\n',
        isT1Enabled: true,
        isT2Enabled: true,
        isT3Enabled: true,
        scoring: '1: acquix\n2: acquix',
      });

      uncorrectedAnswer = factory.buildAnswer.uncorrected();
      validator = new ValidatorQROCMDep({ solution: solution });

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should call solutionServiceQROCMDep', () => {
      // then
      expect(solutionServiceQrocmDep.match).to.have.been.calledWith(
        uncorrectedAnswer.value, solution.value, solution.scoring, solution.deactivations);
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
