const dataObjects = require('../../../../../../lib/infrastructure/datasources/airtable/objects/index');
const factory = require('../../../../../factory');
const competenceRawAirTableFixture = require('../../../../../fixtures/infrastructure/competenceRawAirTableFixture');
const { expect } = require('../../../../../test-helper');

describe('Unit | Infrastructure | Datasource | Airtable | Model | Competence', () => {

  context('#fromAirTableObject', () => {

    it('should create a Competence from the AirtableRecord', () => {
      // given
      const expectedCompetence = factory.buildCompetenceAirtableDataObject();

      // when
      const area = dataObjects.Competence.fromAirTableObject(competenceRawAirTableFixture());

      // then
      expect(area).to.be.an.instanceof(dataObjects.Competence);
      expect(area).to.deep.equal(expectedCompetence);
    });
  });
});
