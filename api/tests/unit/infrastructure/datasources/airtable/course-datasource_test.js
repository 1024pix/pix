const AirtableRecord = require('airtable').Record;
const { expect, sinon } = require('../../../../test-helper');
const courseDatasource = require('../../../../../lib/infrastructure/datasources/airtable/course-datasource');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Airtable | CourseDatasource', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#fromAirTableObject', () => {

    it('should create a Course from the AirtableRecord (challenges should be reversed in order to match the order in the UI)', () => {
      // given
      const airtableRecord = new AirtableRecord('Course', 'recCourse123', {
        'id': 'recCourse123',
        'fields': {
          'id persistant': 'recCourse123',
          'Nom': 'course-name',
          'Description': 'course-description',
          'Adaptatif ?': false,
          'Épreuves (id persistant)': [
            'recChallenge1',
            'recChallenge2',
          ],
          'Competence (id persistant)': ['recCompetence123'],
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

        challenges: ['recChallenge2', 'recChallenge1'],
      };

      expect(course).to.deep.equal(expectedCourse);
    });
  });

});
