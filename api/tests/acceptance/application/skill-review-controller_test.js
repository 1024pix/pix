const { expect, knex, generateValidRequestAuhorizationHeader, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | SkillReviews', () => {

  describe('GET /api/skill-reviews/:id', () => {

    const userIdOfUserWithAssessment = 9999;
    const inserted_assessment = {
      courseId: 1,
      userId: userIdOfUserWithAssessment,
      type: 'SMART_PLACEMENT',
      state: 'completed',
    };

    let assessmentId;

    beforeEach(() => {
      nock.cleanAll();

      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves')
        .query(true)
        .times(3)
        .reply(200, {});

      return knex('assessments').insert(inserted_assessment)
        .then(([createdAssessmentId]) => assessmentId = createdAssessmentId);
    });

    afterEach(() => {
      nock.cleanAll();
      return knex('assessments').delete();
    });

    context('without authorization token', () => {

      it('should return 401 HTTP status code', () => {
        // given
        const skillReviewId = assessmentId;
        const options = {
          method: 'GET',
          url: `/api/skill-reviews/${skillReviewId}`,
          headers: {
            authorization: 'invalid.access.token'
          }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    context('with authorization token', () => {

      context('when the assessment does not exists', () => {
        it('should respond with a 404', () => {
          // given
          const userIdOfUserWithoutAssessment = 8888;
          const skillReviewId = -1;
          const options = {
            method: 'GET',
            url: `/api/skill-reviews/${skillReviewId}`,
            headers: {
              authorization: generateValidRequestAuhorizationHeader(userIdOfUserWithoutAssessment)
            }
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(404);
          });
        });
      });

      context('unallowed to access the skillReview', () => {

        it('should respond with a 403 - forbidden access', () => {
          // given
          const userIdOfUserWithoutAssessment = 8888;
          const skillReviewId = assessmentId;
          const options = {
            method: 'GET',
            url: `/api/skill-reviews/${skillReviewId}`,
            headers: {
              authorization: generateValidRequestAuhorizationHeader(userIdOfUserWithoutAssessment)
            }
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });
      });

      context('allowed to access the skillReview', () => {

        it('should respond with a 200', () => {
          // given
          const skillReviewId = assessmentId;
          const options = {
            method: 'GET',
            url: `/api/skill-reviews/${skillReviewId}`,
            headers: {
              authorization: generateValidRequestAuhorizationHeader(userIdOfUserWithAssessment)
            }
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(200);
          });
        });
      });
    });
  });
});
