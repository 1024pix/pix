const { expect, airtableBuilder, catchErr } = require('../../../test-helper');
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
      const expectedCourse = {
        id: 'recCourse',
        name: 'courseName',
        description: 'courseDescription',
        imageUrl: 'courseImageUrl',
        challenges: ['recChallenge1'],
        competences: ['recCompetence1'],
      };

      beforeEach(() => {
        const airtableCourse = airtableBuilder.factory.buildCourse({
          id: expectedCourse.id,
          nom: expectedCourse.name,
          description: expectedCourse.description,
          image: [{ url: expectedCourse.imageUrl }],
          epreuves: expectedCourse.challenges,
          competence: expectedCourse.competences,
        });
        airtableBuilder.mockLists({ courses: [airtableCourse] });
      });

      it('should return the course', async () => {
        // when
        const actualCourse = await courseRepository.get('recCourse');

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
      const expectedCourse = {
        id: 'recCourse',
        name: 'courseName',
        description: 'courseDescription',
        imageUrl: 'courseImageUrl',
        challenges: ['recChallenge1'],
        competences: ['recCompetence1'],
      };

      beforeEach(() => {
        const airtableCourse = airtableBuilder.factory.buildCourse({
          id: expectedCourse.id,
          nom: expectedCourse.name,
          description: expectedCourse.description,
          image: [{ url: expectedCourse.imageUrl }],
          epreuves: expectedCourse.challenges,
          competence: expectedCourse.competences,
        });
        airtableBuilder.mockLists({ courses: [airtableCourse] });
      });

      it('should return the course name', async () => {
        // when
        const actualCourseName = await courseRepository.getCourseName('recCourse');

        // then
        expect(actualCourseName).to.equal(expectedCourse.name);
      });
    });
  });
});
