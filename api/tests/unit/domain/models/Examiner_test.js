import { Answer } from '../../../../src/evaluation/domain/models/Answer.js';
import { AnswerStatus } from '../../../../src/school/domain/models/AnswerStatus.js';
import { Examiner } from '../../../../lib/domain/models/Examiner.js';
import { expect, domainBuilder, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Models | Examiner', function () {
  const challengeFormat = 'nombre';
  const validator = {
    assess: () => undefined,
  };

  beforeEach(function () {
    validator.assess = sinon.stub();
  });

  describe('#evaluate', function () {
    context('when answer is SKIPPED', function () {
      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;

      beforeEach(function () {
        // given
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ value: '#ABAND#' });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with skipped as result and null as resultDetails', function () {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = AnswerStatus.SKIPPED;
        expectedAnswer.resultDetails = null;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should not call validator.assess', function () {
        // then
        expect(validator.assess).to.not.have.been.called;
      });
    });

    context('when answer is correct and TIMEOUT', function () {
      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;

      beforeEach(function () {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.OK });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ timeout: -12 });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with TIMEOUT as result, and the correct resultDetails', function () {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = AnswerStatus.TIMEDOUT;
        expectedAnswer.resultDetails = validation.resultDetails;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should call validator.assess with answer to assess validity of answer', function () {
        // then
        expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
      });
    });

    context('when answer is correct and FOCUSEDOUT', function () {
      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;
      let isFocusedChallenge;

      beforeEach(function () {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.OK });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ isFocusedOut: true });
        examiner = new Examiner({ validator });
      });

      context('and is a focused challenge', function () {
        beforeEach(function () {
          // given
          isFocusedChallenge = true;
        });

        it('should return an answer with FOCUSEDOUT as result when the assessment is a certification, and the correct resultDetails', function () {
          // given
          const expectedAnswer = new Answer(uncorrectedAnswer);
          expectedAnswer.result = AnswerStatus.FOCUSEDOUT;
          expectedAnswer.resultDetails = validation.resultDetails;

          // when
          correctedAnswer = examiner.evaluate({
            answer: uncorrectedAnswer,
            challengeFormat,
            isFocusedChallenge,
            isCertificationEvaluation: true,
          });

          // then
          expect(correctedAnswer).to.be.an.instanceOf(Answer);
          expect(correctedAnswer).to.deep.equal(expectedAnswer);
        });

        it('should return an answer with OK as result when the assessment is not a certification, and the correct resultDetails', function () {
          // given
          const expectedAnswer = new Answer(uncorrectedAnswer);
          expectedAnswer.result = AnswerStatus.OK;
          expectedAnswer.resultDetails = validation.resultDetails;

          // when
          correctedAnswer = examiner.evaluate({
            answer: uncorrectedAnswer,
            challengeFormat,
            isFocusedChallenge,
            isCertificationEvaluation: false,
          });

          // then
          expect(correctedAnswer).to.be.an.instanceOf(Answer);
          expect(correctedAnswer).to.deep.equal(expectedAnswer);
        });

        it('should call validator.assess with answer to assess validity of answer', function () {
          // when
          examiner.evaluate({
            answer: uncorrectedAnswer,
            challengeFormat,
            isFocusedChallenge,
            isCertificationEvaluation: true,
          });

          // then
          expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
        });
      });

      context('and is not a focused challenge', function () {
        beforeEach(function () {
          // given
          isFocusedChallenge = false;
        });

        it('should return an answer with OK as result when the assessment is a certification, and the correct resultDetails', function () {
          // given
          const expectedAnswer = new Answer(uncorrectedAnswer);
          expectedAnswer.result = AnswerStatus.OK;
          expectedAnswer.resultDetails = validation.resultDetails;

          // when
          correctedAnswer = examiner.evaluate({
            answer: uncorrectedAnswer,
            challengeFormat,
            isFocusedChallenge,
            isCertificationEvaluation: true,
          });

          // then
          expect(correctedAnswer).to.be.an.instanceOf(Answer);
          expect(correctedAnswer).to.deep.equal(expectedAnswer);
        });

        it('should return an answer with OK as result when the assessment is not a certification, and the correct resultDetails', function () {
          // given
          const expectedAnswer = new Answer(uncorrectedAnswer);
          expectedAnswer.result = AnswerStatus.OK;
          expectedAnswer.resultDetails = validation.resultDetails;

          // when
          correctedAnswer = examiner.evaluate({
            answer: uncorrectedAnswer,
            challengeFormat,
            isFocusedChallenge,
            isCertificationEvaluation: false,
          });

          // then
          expect(correctedAnswer).to.be.an.instanceOf(Answer);
          expect(correctedAnswer).to.deep.equal(expectedAnswer);
        });

        it('should call validator.assess with answer to assess validity of answer', function () {
          // when
          examiner.evaluate({
            answer: uncorrectedAnswer,
            challengeFormat,
            isFocusedChallenge,
            isCertificationEvaluation: true,
          });

          // then
          expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
        });
      });
    });

    context('when answer is neither SKIPPED nor TIMEOUT', function () {
      let uncorrectedAnswer;
      let correctedAnswer;
      let examiner;
      let validation;

      beforeEach(function () {
        // given
        validation = domainBuilder.buildValidation({ result: AnswerStatus.OK });
        validator.assess.returns(validation);
        uncorrectedAnswer = domainBuilder.buildAnswer.uncorrected({ timeout: 23, value: 'something true' });
        examiner = new Examiner({ validator });

        // when
        correctedAnswer = examiner.evaluate({ answer: uncorrectedAnswer, challengeFormat });
      });

      it('should return an answer with the validator‘s result and resultDetails', function () {
        const expectedAnswer = new Answer(uncorrectedAnswer);
        expectedAnswer.result = validation.result;
        expectedAnswer.resultDetails = validation.resultDetails;

        // then
        expect(correctedAnswer).to.be.an.instanceOf(Answer);
        expect(correctedAnswer).to.deep.equal(expectedAnswer);
      });
      it('should call validator.assess with answer to assess validity of answer', function () {
        // then
        expect(validator.assess).to.have.been.calledWithExactly({ answer: uncorrectedAnswer, challengeFormat });
      });
    });
  });
});
