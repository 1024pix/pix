const AirtableRecord = require('airtable').Record;
const { expect, sinon } = require('../../../../test-helper');
const demoDatasource = require('../../../../../lib/infrastructure/datasources/airtable/demo-datasource');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Airtable | demoDatasource', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#fromAirTableObject', () => {

    it('should create a Demo from the AirtableRecord (challenges should be reversed in order to match the order in the UI)', () => {
      // given
      const airtableRecord = new AirtableRecord('Demo', 'recDemo123', {
        'id': 'recDemo123',
        'fields': {
          'id persistant': 'recDemo123',
          'Nom': 'demo-name',
          'Description': 'demo-description',
          'Adaptatif ?': false,
          'Épreuves (id persistant)': [
            'recChallenge1',
            'recChallenge2',
          ],
          'Competence (id persistant)': ['recCompetence123'],
          'Image': [
            {
              'url': 'https://example.org/demo.png',
            }
          ],
        },
      });

      // when
      const demo = demoDatasource.fromAirTableObject(airtableRecord);

      // then
      const expectedDemo = {
        id: 'recDemo123',
        name: 'demo-name',
        adaptive: false,

        competences: ['recCompetence123'],
        description: 'demo-description',
        imageUrl: 'https://example.org/demo.png',

        challenges: ['recChallenge2', 'recChallenge1'],
      };

      expect(demo).to.deep.equal(expectedDemo);
    });
  });

});
