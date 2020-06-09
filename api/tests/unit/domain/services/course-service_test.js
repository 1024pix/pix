const courseService = require('../../../../lib/domain/services/course-service');

const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const logger = require('../../../../lib/infrastructure/logger');
const { expect, sinon } = require('../../../test-helper');

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

    context('when the course exists', () => {

      it('should return a Course from the repository', async function() {
        // given
        const courseId = 'recAirtableId';
        const aCourse = Symbol('A course');
        courseRepository.get.withArgs(courseId).resolves(aCourse);

        // when
        const result = await courseService.getCourse({ courseId });

        // then
        expect(result).to.equal(aCourse);
      });

    });
  });
});
