const { expect, knex } = require('../../test-helper');
const server = require('../../../server');
const _ = require('lodash');

describe('Acceptance | Controller | assessment-ratings', () => {

  describe('POST /api/assessment-ratings', () => {

    context('when the assessment is a PREVIEW', () => {

      let options;
      let savedAssessmentId;

      beforeEach(() => {
        return knex('assessments').insert({
          courseId: 'nullCourseId_for_preview',
          estimatedLevel: null,
          pixScore: null,
          type: 'PREVIEW'
        }).then((assessmentIds) => {
          savedAssessmentId = _.first(assessmentIds);

          options = {
            method: 'POST',
            url: '/api/assessment-ratings',
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
                type: 'assessment-ratings'
              }
            },
          };
        });
      });

      afterEach(() => {
        return knex('assessments').delete();
      });

      it('should return a 200 when everything is fine', () => {
        // when
        const promise = server.inject(options);

        // then
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

      it('should update the assessment score and estimatedLevel', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise
          .then(() => knex('assessments').select())
          .then((assessments) => {
            expect(assessments).to.have.lengthOf(1);

            const myAssessment = _.first(assessments);
            expect(myAssessment.estimatedLevel).to.equal(0);
            expect(myAssessment.pixScore).to.equal(0);
            expect(myAssessment.type).to.equal('PREVIEW');
          });
      });
    });
  });

});
