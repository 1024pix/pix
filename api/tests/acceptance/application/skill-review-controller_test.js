const { expect, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | SkillReviews', () => {

  describe('GET /api/skill-reviews/:id', () => {

    const nonPixMasterUserId = 9999;
    const inserted_assessment = {
      courseId: 1,
      userId: nonPixMasterUserId,
      type: 'SMART_PLACEMENT',
      state: 'completed'
    };

    let options;
    let skillReviewId;

    beforeEach(() => {
      return knex('assessments').insert(inserted_assessment)
        .then(([createdAssessmentId]) => {
          skillReviewId = createdAssessmentId;
          options = {
            method: 'GET',
            url: `/api/skill-reviews/${skillReviewId}`,
            headers: {}
          };
        });
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    context('without authorization token', () => {
      beforeEach(() => {
        options.headers.authorization = 'invalid.access.token';
      });

      it('should return 401 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });
});
