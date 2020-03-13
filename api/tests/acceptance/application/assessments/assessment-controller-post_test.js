const { expect, knex, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const BookshelfAssessment = require('../../../../lib/infrastructure/data/assessment');

describe('Acceptance | API | Assessments POST', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/assessments', () => {

    afterEach(async () => {
      await knex('assessments').delete();
      return knex('users').delete();
    });

    let options;
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      options = {
        method: 'POST',
        url: '/api/assessments',
        payload: {
          data: {
            type: 'assessment',
            attributes: {
              type: 'DEMO',
            },
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
                  id: userId
                }
              }
            }
          }
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      return databaseBuilder.commit();
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
        options.payload.data.relationships.user.id = userId;

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          return new BookshelfAssessment({ id: response.result.data.id }).fetch();
        })
          .then((model) => {
            expect(parseInt(model.get('userId'))).to.deep.equal(userId);
          });
      });

      it('should add a new assessment into the database', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then(() => {
          return BookshelfAssessment.count()
            .then((afterAssessmentsNumber) => {
              expect(parseInt(afterAssessmentsNumber, 10)).to.equal(1);
            });
        });
      });

      it('should return persisted Assessment', () => {
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
          return promise.then((response) => {
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
