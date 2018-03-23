const { expect, knex, generateValidRequestAuhorizationHeader, insertUserWithRolePixMaster, cleanupUsersAndPixRolesTables } = require('../../test-helper');
const server = require('../../../server');

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
        return insertUserWithRolePixMaster();
      });

      afterEach(() => {
        return cleanupUsersAndPixRolesTables();
      });

      beforeEach(() => {
        return knex('assessments').insert({
          courseId: 'nullCourseId_for_preview',
          state: 'started',
          type: 'PREVIEW'
        }).then((assessmentIds) => {
          savedAssessmentId = _.first(assessmentIds);

          options = {
            method: 'POST',
            headers: { authorization: generateValidRequestAuhorizationHeader() },
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
        return knex('assessments').delete();
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuhorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
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
          .then(() => knex('assessments').select())
          .then((assessments) => {
            expect(assessments).to.have.lengthOf(1);

            const myAssessment = _.first(assessments);
            expect(myAssessment.state).to.equal('completed');
            expect(myAssessment.type).to.equal('PREVIEW');
          });
      });
    });
  });

});
