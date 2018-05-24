const { expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const AirtableRecord = require('airtable').Record;

const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const Course = require('../../../../lib/domain/models/Course');

const course1 = new AirtableRecord('Tests', 'recTest1', {
  fields: {
    'Nom': 'Test de positionnement 1.1',
    'Description': 'A single line of text.',
    'Adaptatif ?': true,
    'Competence': ['recsvLz0W2ShyfD63'],
    'Image': ['https://dl.airtable.com/foo.jpg'],
    'Épreuves': ['reclvHn6Bg3FyfwuL', 'recPHXe5p4ip95Bc6']
  }
});

const course2 = new AirtableRecord('Tests', 'recTest2', {
  fields: {
    'Nom': 'Gérer des données 1.2',
    'Description': 'A single line of text.',
    'Adaptatif ?': false,
    'Competence': ['recsvLz0W2ShyfD63'],
    'Image': ['https://dl.airtable.com/foo.jpg'],
    'Épreuves': ['reclvHn6Bg3FyfwuL', 'recPHXe5p4ip95Bc6']
  }
});

const sandbox = sinon.sandbox.create();

afterEach(() => {
  sandbox.restore();
});

describe('Unit | Repository | course-repository', function() {

  describe('#get', function() {

    const recordId = 'recTest1';

    beforeEach(() => {
      sandbox.stub(airtable, 'newGetRecord').resolves(course1);
    });

    it('should fetch a course record from Airtable "Tests"', () => {
      // when
      const promise = courseRepository.get(recordId);

      // then
      return promise.then(() => {
        expect(airtable.newGetRecord).to.have.been.calledWith('Tests', recordId);
      });
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.get(recordId);

      // then
      return promise.then((course) => {
        expect(course).to.exist;
        expect(course).to.be.an.instanceOf(Course);
      });
    });

  });

  describe('#getProgressionCourses', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([course1, course2]);
    });

    it('should fetch all progression courses records from Airtable "Tests" with "Publié" status', () => {
      // given
      const expectedQuery = {
        filterByFormula: '{Statut} = "Publié"',
        view: 'Tests de progression'
      };

      // when
      const promise = courseRepository.getProgressionCourses();

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Tests', expectedQuery);
      });
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.getProgressionCourses();

      // then
      return promise.then((courses) => {
        expect(courses).to.have.lengthOf(2);
        expect(courses[0]).to.be.an.instanceOf(Course);
      });
    });

  });

  describe('#getCoursesOfTheWeek', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([course1, course2]);
    });

    it('should fetch all courses of the week records from Airtable "Tests" with "Publié" status', () => {
      // given
      const expectedQuery = {
        filterByFormula: '{Statut} = "Publié"',
        view: 'Défis de la semaine'
      };

      // when
      const promise = courseRepository.getCoursesOfTheWeek();

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Tests', expectedQuery);
      });
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.getCoursesOfTheWeek();

      // then
      return promise.then((courses) => {
        expect(courses).to.have.lengthOf(2);
        expect(courses[0]).to.be.an.instanceOf(Course);
      });
    });

  });

  describe('#getAdaptiveCourses', () => {

    beforeEach(() => {
      sandbox.stub(airtable, 'findRecords').resolves([course1, course2]);
    });

    it('should fetch all adaptive courses records from Airtable "Tests" with "Publié" status', () => {
      // given
      const expectedQuery = {
        filterByFormula: '{Statut} = "Publié"',
        view: 'Tests de positionnement'
      };

      // when
      const promise = courseRepository.getAdaptiveCourses();

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Tests', expectedQuery);
      });
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.getAdaptiveCourses();

      // then
      return promise.then((courses) => {
        expect(courses).to.have.lengthOf(2);
        expect(courses[0]).to.be.an.instanceOf(Course);
      });
    });

  });

});
