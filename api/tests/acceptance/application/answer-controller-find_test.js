const { expect, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | answer-controller', () => {

  describe('GET /api/answers?challengeId=Y&assessmentId=Z', () => {

    let inserted_answer_id = null;

    const queryUrl = '/api/answers?challenge=recLt9uwa2dR3IYpi&assessment=12345';

    const inserted_answer = {
      value: '1,2',
      result: 'ok',
      challengeId: 'recLt9uwa2dR3IYpi',
      assessmentId: '12345'
    };

    beforeEach(() => {
      return knex('answers').insert([inserted_answer])
        .then((ids) => (inserted_answer_id = ids[0]));
    });

    afterEach(() => {
      return knex('answers').delete();
    });

    it('should return 200 HTTP status code', () => {
      // given
      const options = {
        method: 'GET',
        url: queryUrl,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', () => {
      // given
      const options = {
        method: 'GET',
        url: queryUrl,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return required answer', () => {
      // given
      const options = {
        method: 'GET',
        url: queryUrl,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        const answer = response.result.data;
        expect(answer.id).to.equal(inserted_answer_id);
        expect(answer.attributes.value.toString()).to.equal(inserted_answer.value.toString());
        expect(answer.attributes.result.toString()).to.equal(inserted_answer.result.toString());
        expect(answer.relationships.assessment.data.id.toString()).to.equal(inserted_answer.assessmentId.toString());
        expect(answer.relationships.challenge.data.id.toString()).to.equal(inserted_answer.challengeId.toString());
      });
    });

    it('should return 200 with "null" data if not found answer', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/answers?challenge=nothing&assessment=nothing',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.be.null;
      });
    });
  });

});
