const { expect, knex, sinon } = require('../../../test-helper');

const AnswerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const Answer = require('../../../../lib/infrastructure/data/answer');

describe('Unit | Repository | AnswerRepository', () => {

  describe('#get', () => {
    let answerId;

    beforeEach(() => {
      return knex('answers')
        .insert({
          value: '1,2',
          result: 'ko',
          challengeId: 'challenge_1234',
          assessmentId: 353
        })
        .then((createdAnswer) => {
          answerId = createdAnswer[0];
        });
    });

    afterEach(() => {
      return knex('answers').delete();
    });

    it('should retrieve an answer from its id', () => {
      // when
      const promise = AnswerRepository.get(answerId);

      // then
      return promise.then(foundAnswer => {
        expect(foundAnswer.get('id')).to.deep.equal(answerId);
      });
    });
  });

  describe('#findByChallengeAndAssessment', () => {

    // nominal case
    const wrongAnswer = {
      value: '1,2',
      result: 'ko',
      challengeId: 'challenge_1234',
      assessmentId: 1234
    };

    // same assessmentId, different challengeId
    const correctAnswer = {
      value: '1,2,4',
      result: 'ok',
      challengeId: 'challenge_000',
      assessmentId: 1234
    };

    // different assessmentId, same challengeId
    const partiallyCorrectAnswer = {
      value: '3',
      result: 'partially',
      challengeId: 'challenge_1234',
      assessmentId: 1
    };

    beforeEach(() =>
      knex('answers').insert([wrongAnswer, correctAnswer, partiallyCorrectAnswer]));

    afterEach(() =>
      knex('answers').delete());

    it('should find the answer by challenge and assessment and return its in an object', () => {
      // when
      const promise = AnswerRepository.findByChallengeAndAssessment('challenge_1234', 1234);

      // then
      return promise.then(foundAnswers => {
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
      assessmentId: 1234
    };

    // same challenge different assessment
    const wrongAnswerForAssessment1 = {
      value: '1,2',
      result: 'ko',
      challengeId: 'challenge_1234',
      assessmentId: 1
    };

    //different challenge different assessment
    const timedOutAnswerForAssessement1 = {
      value: '1,2,3',
      result: 'timedout',
      challengeId: 'challenge_000',
      assessmentId: 1
    };

    beforeEach(() => knex('answers').insert([wrongAnswerForAssessment1234, wrongAnswerForAssessment1, timedOutAnswerForAssessement1]));

    afterEach(() => knex('answers').delete());

    it('should find all answers by challenge id', () => {
      // when
      const promise = AnswerRepository.findByChallenge('challenge_1234');

      // then
      return promise.then(foundAnswers => {

        expect(foundAnswers).to.exist;

        expect(foundAnswers).to.have.length.of(2);

        expect(foundAnswers[0].attributes.value).to.equal(wrongAnswerForAssessment1234.value);
        expect(foundAnswers[0].attributes.challengeId).to.equal(wrongAnswerForAssessment1234.challengeId);

        expect(foundAnswers[1].attributes.value).to.equal(wrongAnswerForAssessment1.value);
        expect(foundAnswers[1].attributes.challengeId).to.equal(wrongAnswerForAssessment1.challengeId);
      });
    });
  });

  describe('#findCorrectAnswersByAssessment', () => {
    let fetchAllStub;

    beforeEach(() => {
      sinon.stub(Answer.prototype, 'where');
      fetchAllStub = sinon.stub();
    });

    afterEach(() => Answer.prototype.where.restore());

    it('should retrieve answers with ok status from assessment id provided', () => {
      // given
      const assessmentId = 'assessment_id';
      fetchAllStub.resolves({});
      Answer.prototype.where.returns({
        fetchAll: fetchAllStub
      });

      // when
      const promise = AnswerRepository.findCorrectAnswersByAssessment(assessmentId);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(Answer.prototype.where);
        sinon.assert.calledWith(Answer.prototype.where, { assessmentId, result: 'ok' });
        sinon.assert.calledOnce(fetchAllStub);
      });
    });
  });

  describe('#findByAssessment', () => {

    const answer1 = {
      value: 'Un pancake Tabernacle',
      result: 'ko',
      challengeId: 'challenge_tabernacle',
      assessmentId: 1
    };

    const answer2 = {
      value: 'Qu\'est ce qu\'il fout ce pancake Tabernacle',
      result: 'ko',
      challengeId: 'challenge_tabernacle',
      assessmentId: 2
    };

    const answer3 = {
      value: 'la réponse D',
      result: 'timedout',
      challengeId: 'challenge_D',
      assessmentId: 2
    };

    before(() => {
      return knex('answers').insert([answer1, answer2, answer3]);
    });

    after(() => {
      return knex('answers').delete();
    });

    it('should resolves answers with assessment id provided', () => {
      // given
      const assessmentId = 2;

      // when
      const promise = AnswerRepository.findByAssessment(assessmentId);

      // then
      return promise.then((result) => {
        expect(result.length).to.be.equal(2);
        expect(result[0].get('assessmentId')).to.be.equal(2);
        expect(result[1].get('assessmentId')).to.be.equal(2);
      });
    });
  });
});
