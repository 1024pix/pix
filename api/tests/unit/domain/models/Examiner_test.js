const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Examiner = require('../../../../lib/domain/models/Examiner');

const { expect, domainBuilder, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | Examiner', () => {

  const challengeFormat = 'nombre';
  const validator = {
    assess: () => undefined,
  };

  beforeEach(() => {
    validator.assess = sinon.stub();
  });

  describe('#evaluate', () => {

    context('when answer is SKIPPED', () => {

      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;

      beforeEach(() => {
        // given
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ value: '#ABAND#' });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat  });
      });

      it('should return an answer with skipped as result and null as resultDetails', () => {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = AnswerStatus.SKIPPED;
        expectedAnswer.resultDetails = null;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should not call validator.assess', () => {
        // then
        expect(validator.assess).to.not.have.been.called;
      });
    });

    context('when answer is correct and TIMEOUT', () => {

      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;

      beforeEach(() => {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.OK });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ timeout: -12 });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with TIMEOUT as result, and the correct resultDetails', () => {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = AnswerStatus.TIMEDOUT;
        expectedAnswer.resultDetails = validation.resultDetails;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should call validator.assess with answer to assess validity of answer', () => {
        // then
        expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
      });
    });

    context('when answer is partially correct and TIMEOUT', () => {

      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;

      beforeEach(() => {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.PARTIALLY });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ timeout: -12 });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with TIMEOUT as result, and the correct resultDetails', () => {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = AnswerStatus.TIMEDOUT;
        expectedAnswer.resultDetails = validation.resultDetails;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });

      it('should call validator.assess with answer to assess validity of answer', () => {
        // then
        expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
      });
    });

    context('when answer is neither SKIPPED nor TIMEOUT', () => {

      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;

      beforeEach(() => {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.OK });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ timeout: 23, value: 'something true' });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with the validator‘s result and resultDetails', () => {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = validation.result;
        expectedAnswer.resultDetails = validation.resultDetails;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should call validator.assess with answer to assess validity of answer', () => {
        // then
        expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
      });
    });
  });
});
