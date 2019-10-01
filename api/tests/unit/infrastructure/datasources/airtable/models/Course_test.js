const dataObjects = require('../../../../../../lib/infrastructure/datasources/airtable/objects/index');
const AirtableRecord = require('airtable').Record;
const { expect } = require('../../../../../test-helper');

describe('Unit | Infrastructure | Datasource | Airtable | Model | Course', () => {

  context('#fromAirTableObject', () => {

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
      const course = dataObjects.Course.fromAirTableObject(airtableRecord);

      // then
      const expectedCourse = new dataObjects.Course({
        id: 'recCourse123',
        name: 'course-name',
        adaptive: false,

        competences: ['recCompetence123'],
        description: 'course-description',
        imageUrl: 'https://example.org/course.png',

        challenges: ['recChallenge1', 'recChallenge2'],
      });

      expect(course).to.be.an.instanceof(dataObjects.Course);
      expect(course).to.deep.equal(expectedCourse);
    });
  });
});
