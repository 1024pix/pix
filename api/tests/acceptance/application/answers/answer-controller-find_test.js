const { expect, knex } = require('../../../test-helper');
const server = require('../../../../server');

describe('Acceptance | Controller | answer-controller', () => {

  describe('GET /api/answers?challengeId=Y&assessmentId=Z', () => {

    let inserted_answer_id;
    let inserted_assessment_id;
    let queryUrl;

    const inserted_assessment = {
      userId: null,
      courseId: 'rec',
    };

    const inserted_answer = {
      value: '1,2',
      result: 'ok',
      challengeId: 'recLt9uwa2dR3IYpi',
    };

    beforeEach(() => {
      return knex('assessments').insert(inserted_assessment,'id')
        .then(([id]) => {
          inserted_assessment_id = id;
          inserted_answer.assessmentId = inserted_assessment_id;
          queryUrl = `/api/answers?challenge=recLt9uwa2dR3IYpi&assessment=${inserted_assessment_id}`;

          return knex('answers').insert(inserted_answer,'id');
        })
        .then(([id]) => inserted_answer_id = id);
    });

    afterEach(() => {
      return knex('answers').delete()
        .then(() => knex('assessments').delete());
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
      const queryUrl = `/api/answers?challenge=recLt9uwa2dR3IYpi&assessment=${inserted_assessment_id + 1}`;
      const options = {
        method: 'GET',
        url: queryUrl,
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
