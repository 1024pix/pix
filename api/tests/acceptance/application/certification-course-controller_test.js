const { describe, it, after, expect, knex } = require('../../test-helper');
const server = require('../../../server');
const _ = require('lodash');

describe('Acceptance | API | Certification Course', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('GET /api/certification-courses/{id}/result', function() {

    const courseId = '1';
    const options = { method: 'GET', url: `/api/certification-courses/${courseId}/result` };

    beforeEach(function() {
      let assessmentId;
      return knex('assessments').insert({
        courseId: courseId,
        estimatedLevel: 0,
        pixScore: 42,
        type: 'CERTIFICATION'
      }).then(assessmentIds => {
        assessmentId = _.first(assessmentIds);
        return knex('marks').insert([
          {
            level: 2,
            score: 20,
            area_code: 4,
            competence_code: 4.3,
            assessmentId
          },
          {
            level: 4,
            score: 35,
            area_code: 2,
            competence_code: 2.1,
            assessmentId
          }
        ]);
      }).then(() => {
        return knex('certification-courses').insert(
          {
            id: courseId,
            createdAt: '2017-12-21 15:44:38',
            completedAt: '2017-12-21T15:48:38.468Z'
          }
        );
      });
    });

    afterEach(() => {
      return Promise.all([knex('assessments').delete(), knex('marks').delete(), knex('certification-courses').delete()]);
    });

    it('should return 200 HTTP status code', function() {
      // given
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return application/json', function() {
      // given
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        // then
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    it('should retrieve the certification total pix score and certified competences levels', function(done) {
      // when
      server.inject(options, (response) => {
        // then
        const result = response.result.data;
        expect(result.attributes['pix-score']).to.equal(42);
        expect(result.attributes['created-at']).to.equal('2017-12-21 15:44:38');
        expect(result.attributes['completed-at']).to.equal('2017-12-21T15:48:38.468Z');
        expect(result.attributes['competences-with-mark']).to.have.lengthOf(2);

        const firstCertifiedCompetence = result.attributes['competences-with-mark'][0];
        expect(firstCertifiedCompetence.level).to.equal(2);
        expect(firstCertifiedCompetence['competence-code']).to.equal('4.3');

        const secondCertifiedCompetence = result.attributes['competences-with-mark'][1];
        expect(secondCertifiedCompetence.level).to.equal(4);
        expect(secondCertifiedCompetence['competence-code']).to.equal('2.1');
        done();
      });
    });

    it('should return 404 HTTP status code if certification not found', function() {
      // when
      const promise = server.inject({ method: 'GET', url: '/api/certification-courses/200/result' });

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
