import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import * as courseService from '../../../../../src/shared/domain/services/course-service.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Service | Course Service', function () {
  describe('#getCourse', function () {
    const userId = 1;
    const courseId = 'courseABC123';
    let courseRepository;

    beforeEach(function () {
      courseRepository = {
        get: sinon.stub(),
      };
      sinon.stub(logger, 'error');
    });

    it('should throw a NotFoundError when course cannot be played', async function () {
      // given
      const unplayableCourse = domainBuilder.buildCourse({ id: courseId, name: 'mon test statique', isActive: false });
      courseRepository.get.withArgs('courseABC123').resolves(unplayableCourse);

      // when
      const err = await catchErr(courseService.getCourse)({ courseId, userId, dependencies: { courseRepository } });

      // then
      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal("Le test demandé n'existe pas");
    });

    it('should return the course when it can be played', async function () {
      // given
      const playableCourse = domainBuilder.buildCourse({ id: courseId, name: 'mon test statique', isActive: true });
      courseRepository.get.withArgs('courseABC123').resolves(playableCourse);

      // when
      const course = await courseService.getCourse({ courseId, userId, dependencies: { courseRepository } });

      // then
      expect(course).to.deepEqualInstance(playableCourse);
    });
  });
});
