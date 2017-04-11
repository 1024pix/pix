const { describe, after, afterEach, beforeEach, it, knex, expect, nock, before } = require('../../test-helper');

const server = require('../../../server');

describe('Acceptance | API | ChallengeController', function () {

  after(function (done) {
    server.stop(done);
  });

  // validate again all answers of the challenge
  describe('PUT /api/challenges/:challenge_id/validate', function () {

    before(function (done) {
      nock.cleanAll();
      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves/challenge_1234')
        .query(true)
        .times(5)
        .reply(200, {
          'id': 'challenge_1234',
          'fields': {
            'id': 1234,
            'Type d\'épreuve': 'QCM',
            'Bonnes réponses': '1, 2, 3',
          }
        });
      done();
    });

    after(function (done) {
      nock.cleanAll();
      done();
    });

    const ko_answer = {
      value: '1,2,3',
      result: 'ko',
      challengeId: 'challenge_1234'
    };

    const ok_answer = {
      value: '1, 2, 3',
      result: 'partially',
      challengeId: 'challenge_1234'
    };

    const unrelated_answer = {
      value: '1,2,3',
      result: 'ko',
      challengeId: 'challenge_000'
    };

    const unimplemented_answer = {
      value: '1,2,3',
      result: 'unimplemented',
      challengeId: 'challenge_1234'
    };

    const aband_answer = {
      value: '#ABAND#',
      result: 'aband',
      challengeId: 'challenge_1234'
    };

    const timedout_answer = {
      value: '1,2,3',
      result: 'timedout',
      challengeId: 'challenge_1234'
    };


    beforeEach(function (done) {
      knex('answers').delete().then(() => {
        knex('answers').insert([
          ko_answer,
          ok_answer,
          unrelated_answer,
          aband_answer,
          timedout_answer,
          unimplemented_answer]).then(() => {
            done();
          });
      });
    });

    afterEach(function (done) {
      knex('answers').delete().then(() => {done();});
    });

    const options = { method: 'PUT', url: '/api/challenges/challenge_1234/validate' };

    it('should return 200 HTTP status code', function (done) {
      server.inject(options).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.inject(options).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should be able to transform all related answer, but not unrelated answer(s)', function (done) {
      server.inject(options).then(() => {
        knex.select('*').from('answers').then((answers) => {
          const answer_1 = answers[0];
          const answer_2 = answers[1];
          const unrelated_answer = answers[2];
          expect(answer_1.result).to.equal('ok');
          expect(answer_2.result).to.equal('ok');
          expect(unrelated_answer.result).to.equal('ko');
          done();
        });
      });
    });

    it('should be able to change "ok", "ko", "partially", "unimplemented"', function (done) {
      server.inject(options).then((response) => {
        const payload = response.payload;
        const result = JSON.parse(payload);
        expect(result.ok).to.equal(3);
        expect(result.okDiff).to.equal(3);
        expect(result.ko).to.equal(0);
        expect(result.koDiff).to.equal(-1);
        expect(result.partially).to.equal(0);
        expect(result.partiallyDiff).to.equal(-1);
        expect(result.unimplemented).to.equal(0);
        expect(result.unimplementedDiff).to.equal(-1);
        done();
      });
    });

    it('should NOT be able to change "timedout", "aband"', function (done) {
      server.inject(options).then((response) => {
        const payload = response.payload;
        const result = JSON.parse(payload);
        expect(result.timedout).to.equal(1);
        expect(result.timedoutDiff).to.equal(0);
        expect(result.aband).to.equal(1);
        expect(result.abandDiff).to.equal(0);
        done();
      });
    });

  });


});
