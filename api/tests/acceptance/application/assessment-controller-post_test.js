const { expect, knex, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const server = require('../../../server');
const BookshelfAssessment = require('../../../lib/infrastructure/data/assessment');

const User = require('../../../lib/infrastructure/data/user');

describe('Acceptance | API | Assessments POST', () => {

  describe('POST /api/assessments', () => {

    afterEach(() => {
      return knex('assessments').delete();
    });

    let options;

    beforeEach(() => {
      options = {
        method: 'POST',
        url: '/api/assessments',
        payload: {
          data: {
            type: 'assessment',
            attributes: {},
            relationships: {
              course: {
                data: {
                  type: 'course',
                  id: 'non_adaptive_course_id'
                }
              },
              user: {
                data: {
                  type: 'users',
                  id: 0
                }
              }
            }
          }
        },
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
    });

    it('should return 201 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });

    it('should return 201 HTTP status code when missing authorization header', () => {
      // given
      options.headers = {};

      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });

    it('should return application/json', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    describe('when the user is authenticated', () => {

      it('should save user_id in the database', () => {
        // given
        const user = new User({ id: 1234 });

        // when
        const promise = server.inject(options);

        // then
        return promise.then(response => {
          return new BookshelfAssessment({ id: response.result.data.id }).fetch();
        })
          .then(model => {
            expect(model.get('userId')).to.equal(user.id);
          });
      });

      it('should add a new assessment into the database', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then(() => {
          return BookshelfAssessment.count()
            .then((afterAssessmentsNumber) => {
              expect(afterAssessmentsNumber).to.equal(1);
            });
        });
      });

      it('should return persisted assessement', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const assessment = response.result.data;
          expect(assessment.id).to.exist;
          expect(assessment.attributes['user-id']).to.equal(options.payload.data.attributes['user-id']);
          expect(assessment.relationships.course.data.id).to.equal(options.payload.data.relationships.course.data.id);
        });
      });

      describe('when the user is not authenticated', () => {

        it('should persist the given course ID', () => {
          // when
          const promise = server.inject(options);

          // then
          return promise.then(response => {
            return new BookshelfAssessment({ id: response.result.data.id }).fetch();
          })
            .then((model) => {
              expect(model.get('courseId')).to.equal(options.payload.data.relationships.course.data.id);
            });
        });
      });
    });
  });
});
