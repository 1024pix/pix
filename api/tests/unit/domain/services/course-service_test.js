const courseService = require('../../../../lib/domain/services/course-service');

const Course = require('../../../../lib/domain/models/Course');
const { NotFoundError } = require('../../../../lib/domain/errors');

const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const certificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const { describe, it, expect, beforeEach, afterEach, sinon } = require('../../../test-helper');

describe('Unit | Service | Course Service', () => {

  describe('#getCourse', function() {

    let sandbox;
    const airtableCourse = { id: 'recAirtableId' };
    const certificationCourse = new Course({ id: 1 });

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('when the id is a certification course id', () => {

      beforeEach(() => {
        sandbox.stub(certificationCourseRepository, 'get');
      });

      it('should call the certification course repository  ', () => {
        // given
        const givenCourseId = 1;
        certificationCourseRepository.get.resolves();

        // when
        const promise = courseService.getCourse(givenCourseId);

        // then
        return promise.then(() => {
          expect(certificationCourseRepository.get).to.have.been.called;
          expect(certificationCourseRepository.get).to.have.been.calledWith(givenCourseId);
        });
      });

      context('when the course exist', () => {

        it('should return a Course POJO', function() {
          // given
          const givenCourseId = 1;
          certificationCourseRepository.get.resolves(certificationCourse);

          // when
          const promise = courseService.getCourse(givenCourseId);

          // then
          return promise.then((result) => {
            expect(result).to.be.an.instanceof(Course);
            expect(result.id).to.equal(1);
          });
        });

      });

      context('when the course id does not exist', () => {

        it('should return a NotFoundError', function() {
          // given
          const givenCourseId = 'unexistantId';
          certificationCourseRepository.get.rejects(NotFoundError);

          // when
          const promise = courseService.getCourse(givenCourseId);

          // then
          return expect(promise).to.be.rejectedWith(NotFoundError);
        });

      });

    });

    context('when the id is not a certification course id', () => {

      beforeEach(() => {
        sandbox.stub(courseRepository, 'get');
      });

      it('should call the course repository', () => {
        // given
        const givenCourseId = 'recAirtableId';
        courseRepository.get.resolves(airtableCourse);

        // when
        const promise = courseService.getCourse(givenCourseId);

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
          const promise = courseService.getCourse(givenCourseId);

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
          const promise = courseService.getCourse(givenCourseId);

          // then
          return expect(promise).to.be.rejectedWith(NotFoundError);
        });

      });

    });

  });

});
