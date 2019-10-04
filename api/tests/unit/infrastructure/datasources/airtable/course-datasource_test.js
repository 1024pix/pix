const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const courseDatasource = require('../../../../../lib/infrastructure/datasources/airtable/course-datasource');
const { Course } = require('../../../../../lib/infrastructure/datasources/airtable/objects');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | CourseDatasource', () => {

  describe('#getAdaptiveCourses', () => {

    it('should call airtable on Tests table, filter and return Course dataObjects', () => {
      // given
      sinon.stub(airtable, 'findRecords').resolves([
        new AirtableRecord('Course', 'recCourseNotAdaptive', { 'id': 'recCourseNotAdaptive', 'fields': { 'Adaptatif ?': false, 'Statut': 'Publié' } }),
        new AirtableRecord('Course', 'recCourseNotPublished', { 'id': 'recCourseNotPublished', 'fields': { 'Adaptatif ?': true, 'Statut': 'Brouillon' } }),
        new AirtableRecord('Course', 'recCourse123', { 'id': 'recCourse123', 'fields': { 'Adaptatif ?': true, 'Statut': 'Publié' } }),
      ]);

      // when
      const promise = courseDatasource.getAdaptiveCourses();

      // then
      return promise.then((courses) => {
        expect(airtable.findRecords).to.have.been.calledWith('Tests', [
          'Nom',
          'Description',
          'Adaptatif ?',
          'Competence',
          'Épreuves',
          'Image',
        ]);

        expect(courses).to.have.lengthOf(1);
        expect(courses[0]).to.be.an.instanceof(Course);
        expect(courses[0].id).to.equal('recCourse123');
      });
    });
  });

  describe('#get', () => {

    it('should call airtable on Tests table with the id and return a Competence data object', async () => {
      // given
      sinon.stub(airtable, 'getRecord')
        .withArgs('Tests', 'recCourse123')
        .resolves(
          new AirtableRecord('Course', 'recCourse123', { 'id': 'recCourse123', fields: { } })
        );

      // when
      const course = await courseDatasource.get('recCourse123');

      // then
      expect(course).to.be.an.instanceof(Course);
      expect(course.id).to.equal('recCourse123');
    });
  });

});
