const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const solutionServiceQcu = require('../../../../lib/domain/services/solution-service-qcu');
const Validation = require('../../../../lib/domain/models/Validation');
const ValidatorQCU = require('../../../../lib/domain/models/ValidatorQCU');

const { expect, domainBuilder, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | ValidatorQCU', () => {

  beforeEach(() => {

    sinon.stub(solutionServiceQcu, 'match');
  });

  describe('#assess', () => {

    let uncorrectedAnswer;
    let validation;
    let validator;
    let solution;

    beforeEach(() => {
      // given
      solutionServiceQcu.match.returns(AnswerStatus.OK);
      solution = domainBuilder.buildSolution({ type: 'QCU' });

      uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected();
      validator = new ValidatorQCU({ solution: solution });

      // when
      validation = validator.assess({ answer: uncorrectedAnswer });
    });

    it('should call solutionServiceQCU', () => {
      // then
      expect(solutionServiceQcu.match).to.have.been.calledWith(uncorrectedAnswer.value, solution.value);
    });
    it('should return a validation object with the returned status', () => {
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
