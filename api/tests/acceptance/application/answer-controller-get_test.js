const { expect, knex, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | answer-controller', () => {

  describe('GET /api/answers/:id', () => {

    let options;
    let inserted_answer_id;

    const inserted_answer = {
      value: '1,2',
      result: 'ok',
      challengeId: 'recLt9uwa2dR3IYpi',
      assessmentId: '12345'
    };

    beforeEach(() => {
      return knex('answers').insert([inserted_answer])
        .then((ids) => (inserted_answer_id = ids[0]))
        .then(generateValidRequestAuhorizationHeader)
        .then((accessToken) => {
          options = {
            method: 'GET',
            url: `/api/answers/${inserted_answer_id}`,
            headers: { authorization: accessToken },
          };
        });
    });

    afterEach(() => {
      return knex('answers').delete();
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return 200 HTTP status code when missing authorization header', () => {
      // given
      options.headers = {};

      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', () => {
      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should return required answer', () => {
      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        const answer = response.result.data;
        expect(answer.id).to.equal(inserted_answer_id);
        expect(answer.attributes.value.toString()).to.equal(inserted_answer.value.toString());
        expect(answer.attributes.result.toString()).to.equal(inserted_answer.result.toString());
        expect(answer.relationships.assessment.data.id.toString()).to.equal(inserted_answer.assessmentId.toString());
        expect(answer.relationships.challenge.data.id.toString()).to.equal(inserted_answer.challengeId.toString());
      });
    });

  });

});
