const { expect, knex } = require('../../../test-helper');
const server = require('../../../../server');

const _ = require('lodash');

describe('Acceptance | Controller | assessment-results', function() {

  after((done) => {
    server.stop(done);
  });

  describe('POST /api/assessment-results', () => {

    context('when the assessment is a PREVIEW', () => {

      let options;
      let savedAssessmentId;

      beforeEach(() => {
        return knex('assessments').insert({
          courseId: 'nullCourseId_for_preview',
          state: 'started',
          type: 'PREVIEW'
        }, 'id').then((assessmentIds) => {
          savedAssessmentId = _.first(assessmentIds);
          options = {
            method: 'POST',
            url: '/api/assessment-results',
            payload: {
              data: {
                attributes: {
                  'estimated-level': null,
                  'pix-score': null
                },
                relationships: {
                  assessment: {
                    data: {
                      type: 'assessments',
                      id: savedAssessmentId
                    }
                  }
                },
                type: 'assessment-results'
              }
            }
          };
        });
      });

      afterEach(() => {
        return knex('competence-marks').delete()
          .then(() => knex('assessment-results').delete())
          .then(() => knex('assessments').delete());
      });

      it('should return a 200 when everything is fine', () => {
        // when
        const request = server.inject(options);

        // Then
        return request.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should update the assessment state', () => {
        // when
        const request = server.inject(options);

        // Then
        return request
          .then(() => knex('assessments').select().where('id', savedAssessmentId))
          .then((assessments) => {
            const myAssessment = _.first(assessments);
            expect(myAssessment.state).to.equal('completed');
            expect(myAssessment.type).to.equal('PREVIEW');
          });
      });
    });
  });

});
