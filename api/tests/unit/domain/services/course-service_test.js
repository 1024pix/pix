const courseService = require('../../../../lib/domain/services/course-service');

const Course = require('../../../../lib/domain/models/Course');
const { NotFoundError } = require('../../../../lib/domain/errors');
const { InfrastructureError } = require('../../../../lib/application/errors');

const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const logger = require('../../../../lib/infrastructure/logger');
const { expect, sinon, catchErr } = require('../../../test-helper');

describe('Unit | Service | Course Service', () => {

  describe('#getCourse', function() {

    const userId = 1;
    const airtableCourse = { id: 'recAirtableId' };

    beforeEach(() => {
      sinon.stub(courseRepository, 'get');
      sinon.stub(logger, 'error');
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

    context('when an error occurred', () => {

      it('should log the error', async () => {
        // given
        const givenCourseId = 'recAirtableId';
        const error = new Error();
        courseRepository.get.rejects(error);

        try {
          // when
          await courseService.getCourse({ courseId: givenCourseId, userId });

        } catch (err) {
          // then
          expect(logger.error).to.have.been.calledWith(error);
        }
      });

      it('should throw an InfrastructureException by default', async () => {
        // given
        const givenCourseId = 'recAirtableId';
        const error = new Error('Some message');
        courseRepository.get.rejects(error);

        // when
        const err = await catchErr(courseService.getCourse)({ courseId: givenCourseId, userId });

        // then
        expect(err).to.be.an.instanceof(InfrastructureError);
      });

      it('should throw a NotFoundError if the course was not found', () => {
        // given
        const givenCourseId = 'recAirtableId';
        const error = {
          error: {
            type: 'MODEL_ID_NOT_FOUND',
            message: 'Could not find row by id unknown_id'
          }
        };
        courseRepository.get.rejects(error);

        // when
        const promise = courseService.getCourse({ courseId: givenCourseId, userId });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });
  });
});
