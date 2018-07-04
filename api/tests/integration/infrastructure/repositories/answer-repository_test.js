const { expect, knex, factory, databaseBuilder } = require('../../../test-helper');
const Answer = require('../../../../lib/domain/models/Answer');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

const AnswerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');

describe('Integration | Repository | AnswerRepository', () => {

  afterEach(() => {
    return knex('answers').delete()
      .then(() => (databaseBuilder.clean()));
  });

  describe('#get', () => {
    let answerId;

    context('when there are no answers', () => {

      it('should reject an error if nothing is found', () => {
        // when
        const promise = AnswerRepository.get(100);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });

    context('when there is an answer', () => {

      beforeEach(() => {
        return knex('answers')
          .insert({
            value: '1,2',
            result: 'ko',
            challengeId: 'challenge_1234',
            assessmentId: 353,
          })
          .then((createdAnswer) => {
            answerId = createdAnswer[0];
          });
      });

      it('should retrieve an answer from its id', () => {
        // when
        const promise = AnswerRepository.get(answerId);

        // then
        return promise.then((foundAnswer) => {
          expect(foundAnswer).to.be.an.instanceof(Answer);
          expect(foundAnswer.id).to.equal(answerId);
        });
      });
    });
  });

  describe('#findByChallengeAndAssessment', () => {

    // nominal case
    const wrongAnswer = {
      value: '1,2',
      result: 'ko',
      challengeId: 'challenge_1234',
      assessmentId: 1234,
    };

    // same assessmentId, different challengeId
    const correctAnswer = {
      value: '1,2,4',
      result: 'ok',
      challengeId: 'challenge_000',
      assessmentId: 1234,
    };

    // different assessmentId, same challengeId
    const partiallyCorrectAnswer = {
      value: '3',
      result: 'partially',
      challengeId: 'challenge_1234',
      assessmentId: 1,
    };

    beforeEach(() => {
      return knex('answers').insert([wrongAnswer, correctAnswer, partiallyCorrectAnswer]);
    });

    it('should find the answer by challenge and assessment and return its in an object', () => {
      // when
      const promise = AnswerRepository.findByChallengeAndAssessment('challenge_1234', 1234);

      // then
      return promise.then((foundAnswers) => {
        expect(foundAnswers).to.exist;
        expect(foundAnswers).to.be.an('object');
        expect(foundAnswers.attributes.value).to.equal(wrongAnswer.value);
      });
    });
  });

  describe('#findByChallenge', () => {

    const wrongAnswerForAssessment1234 = {
      value: '1',
      result: 'ko',
      challengeId: 'challenge_1234',
      assessmentId: 1234,
    };

    // same challenge different assessment
    const wrongAnswerForAssessment1 = {
      value: '1,2',
      result: 'ko',
      challengeId: 'challenge_1234',
      assessmentId: 1,
    };

    //different challenge different assessment
    const timedOutAnswerForAssessment1 = {
      value: '1,2,3',
      result: 'timedout',
      challengeId: 'challenge_000',
      assessmentId: 1,
    };

    beforeEach(() => {
      return knex('answers').insert([wrongAnswerForAssessment1234, wrongAnswerForAssessment1, timedOutAnswerForAssessment1]);
    });

    it('should find all answers by challenge id', () => {
      // when
      const promise = AnswerRepository.findByChallenge('challenge_1234');

      // then
      return promise.then((foundAnswers) => {

        expect(foundAnswers).to.exist;

        expect(foundAnswers).to.have.length.of(2);

        expect(foundAnswers[0].attributes.value).to.equal(wrongAnswerForAssessment1234.value);
        expect(foundAnswers[0].attributes.challengeId).to.equal(wrongAnswerForAssessment1234.challengeId);

        expect(foundAnswers[1].attributes.value).to.equal(wrongAnswerForAssessment1.value);
        expect(foundAnswers[1].attributes.challengeId).to.equal(wrongAnswerForAssessment1.challengeId);
      });
    });
  });

  describe('#findByAssessment', () => {

    const answer1 = {
      value: 'Un pancake Tabernacle',
      result: 'ko',
      challengeId: 'challenge_tabernacle',
      assessmentId: 1,
    };

    const answer2 = {
      value: 'Qu\'est ce qu\'il fout ce pancake Tabernacle',
      result: 'ko',
      challengeId: 'challenge_tabernacle',
      assessmentId: 2,
    };

    const answer3 = {
      value: 'la réponse D',
      result: 'timedout',
      challengeId: 'challenge_D',
      assessmentId: 2,
    };

    beforeEach(() => {
      return knex('answers').delete().then(() => knex('answers').insert([answer1, answer2, answer3]));
    });

    it('should resolves answers with assessment id provided', () => {
      // given
      const assessmentId = 2;

      // when
      const promise = AnswerRepository.findByAssessment(assessmentId);

      // then
      return promise.then((answers) => {
        expect(answers.length).to.be.equal(2);
        expect(answers[0].assessmentId).to.be.equal(2);
        expect(answers[1].assessmentId).to.be.equal(2);
      });
    });

    it('should returns answers as domain objects', () => {
      // given
      const assessmentId = 2;

      // when
      const promise = AnswerRepository.findByAssessment(assessmentId);

      // then
      return promise.then((answers) => {
        expect(answers[0]).to.be.instanceof(Answer);
        expect(answers[1]).to.be.instanceof(Answer);
      });
    });
  });

  describe('#findCorrectAnswersByAssessment', () => {

    const answer1 = {
      value: 'Un pancake Tabernacle',
      result: 'ok',
      challengeId: 'challenge_tabernacle',
      assessmentId: 2,
    };

    const answer2 = {
      value: 'Qu\'est ce qu\'il fout ce pancake Tabernacle',
      result: 'ok',
      challengeId: 'challenge_tabernacle',
      assessmentId: 1,
    };

    const answer3 = {
      value: 'la réponse D',
      result: 'ko',
      challengeId: 'challenge_D',
      assessmentId: 1,
    };

    beforeEach(() => {
      return knex('answers').delete().then(() => knex('answers').insert([answer1, answer2, answer3]));
    });

    it('should retrieve answers with ok status from assessment id provided', () => {
      // given
      const assessmentId = 1;

      // when
      const promise = AnswerRepository.findCorrectAnswersByAssessment(assessmentId);

      // then
      return promise.then((answers) => {
        expect(answers).to.exist;
        expect(answers).to.have.length.of(1);

        const foundAnswer = answers.models[0];

        expect(foundAnswer.get('assessmentId')).to.be.equal(1);
        expect(foundAnswer.get('result')).to.be.equal('ok');
      });
    });
  });

  describe('#hasChallengeAlreadyBeenAnswered', () => {

    it('should return true if answer exists in database', async () => {
      // given
      const { challengeId, assessmentId } = databaseBuilder.factory.buildAnswer();

      await databaseBuilder.commit();

      // when
      const promise = AnswerRepository.hasChallengeAlreadyBeenAnswered({
        challengeId,
        assessmentId,
      });

      // then
      return expect(promise).to.eventually.be.true;
    });

    it('should return false if answer does not exist in database', async () => {
      // given
      const { assessmentId } = databaseBuilder.factory.buildAnswer();
      const otherChallengeId = 'rec1234';

      await databaseBuilder.commit();

      // when
      const promise = AnswerRepository.hasChallengeAlreadyBeenAnswered({
        challengeId: otherChallengeId,
        assessmentId,
      });

      // then
      return expect(promise).to.eventually.be.false;
    });
  });

  describe('#save', () => {

    let answer;
    let promise;

    beforeEach(async () => {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      await databaseBuilder.commit();

      // XXX resultDetails is by default null which is saved as "null\n" in db.
      // To avoid problems in test it is fixed to another string.
      answer = factory.buildAnswer({ assessmentId, resultDetails: 'some random detail' });
      answer.id = undefined;

      // when
      promise = AnswerRepository.save(answer);
    });

    it('should save the answer in db', async () => {
      // then
      // id, createdAt, and updatedAt are not present
      const expectedRawAnswerWithoutIdNorDates = {
        value: answer.value,
        result: answer.result.raw,
        assessmentId: answer.assessmentId,
        challengeId: answer.challengeId,
        timeout: answer.timeout,
        elapsedTime: answer.elapsedTime,
        resultDetails: `${answer.resultDetails}\n`, // XXX text fields are saved with a \n at the end
      };
      return promise
        .then(() => knex('answers').first())
        .then((answer) => _.omit(answer, ['id', 'createdAt', 'updatedAt']))
        .then((answerWithoutIdNorDates) => {
          return expect(answerWithoutIdNorDates).to.deep.equal(expectedRawAnswerWithoutIdNorDates);
        });
    });

    it('should return a domain object with the id', async () => {
      // then
      return promise
        .then((savedAnswer) => {
          expect(savedAnswer.id).to.not.equal(undefined);
          expect(savedAnswer).to.be.an.instanceOf(Answer);
          // XXX text fields are saved with a \n at the end, so the test fails for that reason
          expect(_.omit(savedAnswer, ['id', 'resultDetails'])).to.deep.equal(_.omit(answer, ['id', 'resultDetails']));
        });
    });
  });
})
;
