const { describe, it, before, after, expect, knex } = require('../../../test-helper');

const AnswerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');

describe('Unit | Repository | AnswerRepository', function () {


  describe('findByChallengeAndAssessment', function () {

    // nominal case
    const inserted_answer_1 = {
      value: '1,2',
      result: 'ko',
      challengeId: 'challenge_1234',
      assessmentId: 1234
    };

    // same assessmentId, different challengeId
    const inserted_answer_2 = {
      value: '1,2,4',
      result: 'ok',
      challengeId: 'challenge_000',
      assessmentId: 1234
    };

    // different assessmentId, same challengeId
    const inserted_answer_3 = {
      value: '3',
      result: 'partially',
      challengeId: 'challenge_1234',
      assessmentId: 1
    };

    before(function (done) {
      knex('answers').delete().then(() => {
        knex('answers').insert([inserted_answer_1, inserted_answer_2, inserted_answer_3]).then(() => {
          done();
        });
      });
    });

    after(function (done) {
      knex('answers').delete().then(() => {done();});
    });

    it('should find the answer by challenge and assessment and return its in an object', function (done) {
      expect(AnswerRepository.findByChallengeAndAssessment).to.exist;
      AnswerRepository.findByChallengeAndAssessment('challenge_1234', 1234).then(function(foundAnswers) {
        expect(foundAnswers).to.exist;
        expect(foundAnswers).to.be.an('object');
        expect(foundAnswers.attributes.value).to.equal(inserted_answer_1.value);
        done();
      });
    });
  });

  describe('findByChallenge', function () {

    const inserted_answer_1 = {
      value: '1',
      result: 'ko',
      challengeId: 'challenge_1234',
      assessmentId: 1234
    };

    // same challenge different assessment
    const inserted_answer_2 = {
      value: '1,2',
      result: 'ko',
      challengeId: 'challenge_1234',
      assessmentId: 1
    };

    //different challenge different assessment
    const inserted_answer_3 = {
      value: '1,2,3',
      result: 'timedout',
      challengeId: 'challenge_000',
      assessmentId: 1
    };

    before(function (done) {
      knex('answers').delete().then(() => {
        knex('answers').insert([inserted_answer_1, inserted_answer_2, inserted_answer_3]).then(() => {
          done();
        });
      });
    });

    after(function (done) {
      knex('answers').delete().then(() => {done();});
    });

    it('should find all answers by challenge', function (done) {

      expect(AnswerRepository.findByChallenge).to.exist;

      AnswerRepository.findByChallenge('challenge_1234').then(function(foundAnswers) {

        expect(foundAnswers).to.exist;

        expect(foundAnswers).to.have.length.of(2);

        expect(foundAnswers[0].attributes.value).to.equal(inserted_answer_1.value);
        expect(foundAnswers[0].attributes.challengeId).to.equal(inserted_answer_1.challengeId);

        expect(foundAnswers[1].attributes.value).to.equal(inserted_answer_2.value);
        expect(foundAnswers[1].attributes.challengeId).to.equal(inserted_answer_2.challengeId);

        done();
      });
    });
  });

});
