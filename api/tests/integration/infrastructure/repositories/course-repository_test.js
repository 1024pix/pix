const { expect, airtableBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Course = require('../../../../lib/domain/models/Course');
const { NotFoundError } = require('../../../../lib/domain/errors');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');

describe('Integration | Repository | course-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#get', () => {

    context('when course exists', () => {

      it('should return the course', async () => {
        // given
        const expectedCourse = domainBuilder.buildCourse();
        const airtableCourse = airtableBuilder.factory.buildCourse.fromDomain({ domainCourse: expectedCourse });
        airtableBuilder.mockLists({ courses: [airtableCourse] });

        // when
        const actualCourse = await courseRepository.get(expectedCourse.id);

        // then
        expect(actualCourse).to.be.instanceOf(Course);
        expect(actualCourse).to.deep.equal(expectedCourse);
      });
    });
  });

  describe('#getCourseName', () => {

    context('when course does not exist', () => {

      it('should return all areas without fetching competences', async () => {
        // when
        const error = await catchErr(courseRepository.getCourseName)('illusion');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });

    });

    context('when course exists', () => {

      it('should return the course name', async () => {
        // given
        const expectedCourse = domainBuilder.buildCourse();
        const airtableCourse = airtableBuilder.factory.buildCourse.fromDomain({ domainCourse: expectedCourse });
        airtableBuilder.mockLists({ courses: [airtableCourse] });

        // when
        const actualCourseName = await courseRepository.getCourseName(expectedCourse.id);

        // then
        expect(actualCourseName).to.equal(expectedCourse.name);
      });
    });
  });
});
