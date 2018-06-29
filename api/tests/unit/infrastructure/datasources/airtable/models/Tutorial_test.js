const dataModels = require('../../../../../../lib/infrastructure/datasources/airtable/objects/index');
const tutorialRawAirTableFixture = require('../../../../../fixtures/infrastructure/tutorialRawAirtableFixture');
const tutorialAirtableDataModelFixture = require('../../../../../fixtures/infrastructure/tutorialAirtableDataObjectFixture');
const { expect } = require('../../../../../test-helper');

describe('Unit | Infrastructure | Datasource | Airtable | Model | Tutorial', () => {

  context('#fromAirTableObject', () => {

    it('should create a Tutorial from the AirtableRecord', () => {
      // given
      const expectedTuto = tutorialAirtableDataModelFixture();

      // when
      const tuto = dataModels.Tutorial.fromAirTableObject(tutorialRawAirTableFixture());

      // then
      expect(tuto).to.be.an.instanceof(dataModels.Tutorial);
      expect(tuto).to.deep.equal(expectedTuto);
    });
  });
});
