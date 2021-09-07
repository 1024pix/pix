const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Examiner = require('../../../../lib/domain/models/Examiner');

const { expect, domainBuilder, sinon } = require('../../../test-helper');

describe('Unit | Domain | Models | Examiner', function() {

  const challengeFormat = 'nombre';
  const validator = {
    assess: () => undefined,
  };

  beforeEach(function() {
    validator.assess = sinon.stub();
  });

  describe('#evaluate', function() {

    context('when answer is SKIPPED', function() {

      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;

      beforeEach(function() {
        // given
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ value: '#ABAND#' });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with skipped as result and null as resultDetails', function() {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = AnswerStatus.SKIPPED;
        expectedAnswer.resultDetails = null;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should not call validator.assess', function() {
        // then
        expect(validator.assess).to.not.have.been.called;
      });
    });

    context('when answer is correct and TIMEOUT', function() {

      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;

      beforeEach(function() {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.OK });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ timeout: -12 });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with TIMEOUT as result, and the correct resultDetails', function() {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = AnswerStatus.TIMEDOUT;
        expectedAnswer.resultDetails = validation.resultDetails;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should call validator.assess with answer to assess validity of answer', function() {
        // then
        expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
      });
    });

    context('when answer is correct and FOCUSEDOUT', function() {

      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;

      beforeEach(function() {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.OK });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ focusedOut: true });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with FOCUSED as result, and the correct resultDetails', function() {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = AnswerStatus.FOCUSEDOUT;
        expectedAnswer.resultDetails = validation.resultDetails;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });

      it('should call validator.assess with answer to assess validity of answer', function() {
        // then
        expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
      });
    });

    context('when answer is neither SKIPPED nor TIMEOUT', function() {

      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;

      beforeEach(function() {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.OK });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ timeout: 23, value: 'something true' });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with the validator‘s result and resultDetails', function() {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = validation.result;
        expectedAnswer.resultDetails = validation.resultDetails;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should call validator.assess with answer to assess validity of answer', function() {
        // then
        expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
      });
    });
  });
});
