const { describe, it, after, afterEach, expect, knex } = require('../../test-helper');
const server = require('../../../server');
const BookshelfAssessment = require('../../../lib/infrastructure/data/assessment');

const tokenService = require('../../../lib/domain/services/token-service');
const User = require('../../../lib/infrastructure/data/user');

describe('Acceptance | API | Assessments POST', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('POST /api/assessments', function() {

    afterEach(() => {
      return knex('assessments').delete();
    });

    let options;

    beforeEach(() => {
      options = {
        method: 'POST', url: '/api/assessments', payload: {
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
        }
      };
    });

    it('should return 201 HTTP status code', function() {
      const promise = server.inject(options);

      // Then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });

    it('should return application/json', function() {
      // When
      const promise = server.inject(options);

      // Then
      return promise.then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });
    });

    describe('when the user is authenticated', () => {

      it('should save user_id in the database', () => {
        // Given
        const user = new User({ id: 436357 });
        const token = tokenService.createTokenFromUser(user);
        options.headers = {};
        options.headers['Authorization'] = `Bearer ${token}`;

        // When
        const promise = server.injectThen(options);

        // Then
        return promise.then(response => {
          return new BookshelfAssessment({ id: response.result.data.id }).fetch();
        })
          .then(model => {
            expect(model.get('userId')).to.equal(436357);
          });
      });

      it('should add a new assessment into the database', function() {
        // when
        const promise = server.inject(options);

        // Then
        return promise.then(
          () => {
            return BookshelfAssessment.count();
          })
          .then(function(afterAssessmentsNumber) {
            expect(afterAssessmentsNumber).to.equal(1);
          });
      });

      it('should return persisted assessement', function() {

        // when
        const promise = server.inject(options);

        // Then
        return promise.then((response) => {
          const assessment = response.result.data;

          // then
          expect(assessment.id).to.exist;
          expect(assessment.attributes['user-id']).to.equal(options.payload.data.attributes['user-id']);
          expect(assessment.relationships.course.data.id).to.equal(options.payload.data.relationships.course.data.id);
        });
      });

      describe('when the user is not authenticated', () => {

        it('should persist the given course ID', function() {
          // when
          const promise = server.inject(options);

          // Then
          return promise.then(response => {
            return new BookshelfAssessment({ id: response.result.data.id }).fetch();
          })
            .then(function(model) {
              expect(model.get('courseId')).to.equal(options.payload.data.relationships.course.data.id);
            });
        });

      });

    });

  });
});
