const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const solutionServiceQroc = require('../../../../lib/domain/services/solution-service-qroc');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQROC = require('../../../../lib/domain/models/ValidatorQROC');

const { expect, factory, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | ValidatorQROC', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(solutionServiceQroc, 'match');
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
      solutionServiceQroc.match.returns(AnswerStatus.OK);
      solution = factory.buildSolution({ type: 'QROC' });

      uncorrectedAnswer = factory.buildAnswer.uncorrected();
      validator = new ValidatorQROC({ solution: solution });

      // when
      validation = validator.assess(uncorrectedAnswer);
    });

    it('should call solutionServiceQROC', () => {
      // then
      expect(solutionServiceQroc.match).to.have.been.calledWith(
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
