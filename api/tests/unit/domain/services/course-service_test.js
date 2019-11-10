const courseService = require('../../../../lib/domain/services/course-service');

const Course = require('../../../../lib/domain/models/Course');
const { NotFoundError } = require('../../../../lib/domain/errors');

const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const { expect, sinon } = require('../../../test-helper');

describe('Unit | Service | Course Service', () => {

  describe('#getCourse', function() {

    const userId = 1;
    const airtableCourse = { id: 'recAirtableId' };

    beforeEach(() => {
      sinon.stub(courseRepository, 'get');
    });

    it('should call the course repository', () => {
      // given
      const givenCourseId = 'recAirtableId';
      courseRepository.get.resolves(airtableCourse);

      // when
      const promise = courseService.getCourse({ courseId: givenCourseId, userId });

      // then
      return promise.then(() => {
        expect(courseRepository.get).to.have.been.called;
        expect(courseRepository.get).to.have.been.calledWith(givenCourseId);
      });
    });

    context('when the course exist', () => {

      it('should return a Course POJO', function() {
        // given
        const givenCourseId = 'recAirtableId';
        courseRepository.get.resolves(airtableCourse);

        // when
        const promise = courseService.getCourse({ courseId: givenCourseId, userId });

        // then
        return promise.then((result) => {
          expect(result).to.be.an.instanceof(Course);
          expect(result.id).to.equal('recAirtableId');

        });
      });

    });

    context('when the course was not found', () => {

      const error = {
        error: {
          type: 'MODEL_ID_NOT_FOUND',
          message: 'Could not find row by id unknown_id'
        }
      };

      it('should return a NotFoundError ', function() {
        // given
        const givenCourseId = 'recAirtableId';
        courseRepository.get.rejects(error);

        // when
        const promise = courseService.getCourse({ courseId: givenCourseId, userId });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });

    });

  });

});
