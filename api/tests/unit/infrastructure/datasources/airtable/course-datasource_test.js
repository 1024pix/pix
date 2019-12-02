const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const courseDatasource = require('../../../../../lib/infrastructure/datasources/airtable/course-datasource');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | CourseDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Course from the AirtableRecord', () => {
      // given
      const airtableRecord = new AirtableRecord('Course', 'recCourse123', {
        'id': 'recCourse123',
        'fields': {
          'Nom': 'course-name',
          'Description': 'course-description',
          'Adaptatif ?': false,
          'Épreuves': [
            'recChallenge1',
            'recChallenge2',
          ],
          'Competence': ['recCompetence123'],
          'Image': [
            {
              'url': 'https://example.org/course.png',
            }
          ],
        },
      });

      // when
      const course = courseDatasource.fromAirTableObject(airtableRecord);

      // then
      const expectedCourse = {
        id: 'recCourse123',
        name: 'course-name',
        adaptive: false,

        competences: ['recCompetence123'],
        description: 'course-description',
        imageUrl: 'https://example.org/course.png',

        challenges: ['recChallenge1', 'recChallenge2'],
      };

      expect(course).to.deep.equal(expectedCourse);
    });
  });

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
      expect(course.id).to.equal('recCourse123');
    });
  });

});
