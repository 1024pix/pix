const { expect, sinon } = require('../../../test-helper');
const airtable = require('../../../../lib/infrastructure/airtable');
const AirtableRecord = require('airtable').Record;
const _ = require('lodash');

const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const Course = require('../../../../lib/domain/models/Course');

const adaptativeCourse =
  new AirtableRecord('Tests', 'recTestAdaptative', {
    fields: {
      'Nom': 'Test de positionnement 1.1',
      'Description': 'A single line of text.',
      'Adaptatif ?': true,
      'Défi de la semaine ?': false,
      'Competence': ['recsvLz0W2ShyfD63'],
      'Image': ['https://dl.airtable.com/foo.jpg'],
      'Épreuves': ['reclvHn6Bg3FyfwuL', 'recPHXe5p4ip95Bc6'],
      'Statut': 'Publié',
    }
  });

const courses = [
  adaptativeCourse,

  new AirtableRecord('Tests', 'recTestNonAdaptative', {
    fields: {
      'Nom': 'Gérer des données 1.2',
      'Description': 'A single line of text.',
      'Adaptatif ?': false,
      'Défi de la semaine ?': false,
      'Competence': ['recsvLz0W2ShyfD63'],
      'Image': ['https://dl.airtable.com/foo.jpg'],
      'Épreuves': ['reclvHn6Bg3FyfwuL', 'recPHXe5p4ip95Bc6'],
      'Statut': 'Publié',
    }
  }),

  new AirtableRecord('Tests', 'recTestCourseOfTheWeek', {
    fields: {
      'Nom': 'Adapter les documents à leur finalité',
      'Adaptatif ?': false,
      'Défi de la semaine ?': true,
      'Competence': ['recsvLz0W2ShyfD63'],
      'Image': ['https://dl.airtable.com/foo.jpg'],
      'Épreuves': ['reclvHn6Bg3FyfwuL', 'recPHXe5p4ip95Bc6'],
      'Statut': 'Publié',
    }
  }),

  new AirtableRecord('Tests', 'recTestAdaptativeUnpublished', {
    fields: {
      'Nom': 'Test de positionnement 1.1',
      'Adaptatif ?': true,
      'Défi de la semaine ?': false,
      'Statut': 'Proposé',
    }
  }),

  new AirtableRecord('Tests', 'recTestNonAdaptativeUnpublished', {
    fields: {
      'Nom': 'Gérer des données 1.2',
      'Adaptatif ?': false,
      'Défi de la semaine ?': false,
      'Statut': 'Proposé',
    }
  }),

  new AirtableRecord('Tests', 'rectTestCourseOfTheWeekUnpublished', {
    fields: {
      'Nom': 'Adapter les documents à leur finalité',
      'Adaptatif ?': false,
      'Défi de la semaine ?': true,
      'Statut': 'Proposé',
    }
  }),
];

describe('Unit | Repository | course-repository', function() {

  beforeEach(() => {
    sinon.stub(airtable, 'findRecords')
      .withArgs('Tests')
      .resolves(courses);
  });

  describe('#get', function() {

    beforeEach(() => {
      sinon.stub(airtable, 'getRecord')
        .withArgs('Tests', 'recTestAdaptative')
        .resolves(adaptativeCourse);
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.get('recTestAdaptative');

      // then
      return promise.then((course) => {
        expect(course).to.exist;
        expect(course).to.be.an.instanceOf(Course);
      });
    });

  });

  describe('#getAdaptiveCourses', () => {

    it('should return Course domain objects matching adaptative criteria', () => {
      // when
      const promise = courseRepository.getAdaptiveCourses();

      // then
      return promise.then((courses) => {
        expect(_.map(courses, 'id')).to.have.members(['recTestAdaptative']);
        expect(courses[0]).to.be.an.instanceOf(Course);
      });
    });

  });

  describe('#getCourseName', function() {

    beforeEach(() => {
      sinon.stub(airtable, 'getRecord')
        .withArgs('Tests', 'recTestAdaptative')
        .resolves(adaptativeCourse);
    });

    it('should return Course domain objects', () => {
      // when
      const promise = courseRepository.getCourseName('recTestAdaptative');

      // then
      return promise.then((courseName) => {
        expect(courseName).to.exist;
        expect(courseName).to.equal('Test de positionnement 1.1');
      });
    });

  });

});
