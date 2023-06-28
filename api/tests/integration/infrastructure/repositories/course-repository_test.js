import { expect, domainBuilder, catchErr, mockLearningContent } from '../../../test-helper.js';
import { Course } from '../../../../lib/shared/domain/models/Course.js';
import { NotFoundError } from '../../../../lib/shared/domain/errors.js';
import * as courseRepository from '../../../../lib/shared/infrastructure/repositories/course-repository.js';

describe('Integration | Repository | course-repository', function () {
  describe('#get', function () {
    context('when course exists', function () {
      it('should return the course', async function () {
        // given
        const expectedCourse = domainBuilder.buildCourse();
        mockLearningContent({ courses: [{ ...expectedCourse }] });

        // when
        const actualCourse = await courseRepository.get(expectedCourse.id);

        // then
        expect(actualCourse).to.be.instanceOf(Course);
        expect(actualCourse).to.deep.equal(expectedCourse);
      });
    });
  });

  describe('#getCourseName', function () {
    context('when course does not exist', function () {
      it('should return all areas without fetching competences', async function () {
        // when
        const error = await catchErr(courseRepository.getCourseName)('illusion');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when course exists', function () {
      it('should return the course name', async function () {
        // given
        const expectedCourse = domainBuilder.buildCourse();
        mockLearningContent({ courses: [{ ...expectedCourse }] });

        // when
        const actualCourseName = await courseRepository.getCourseName(expectedCourse.id);

        // then
        expect(actualCourseName).to.equal(expectedCourse.name);
      });
    });
  });
});
