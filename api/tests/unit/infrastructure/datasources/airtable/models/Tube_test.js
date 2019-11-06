const dataModels = require('../../../../../../lib/infrastructure/datasources/airtable/objects/index');
const tubeRawAirTableFixture = require('../../../../../tooling/fixtures/infrastructure/tubeRawAirTableFixture');
const TubeAirtableDataModelFixture = require('../../../../../tooling/fixtures/infrastructure/tubeAirtableDataObjectFixture');
const { expect } = require('../../../../../test-helper');

describe('Unit | Infrastructure | Datasource | Airtable | Model | Tube', () => {

  context('#fromAirTableObject', () => {

    it('should create a Tube from the AirtableRecord', () => {
      // given
      const expectedTube = TubeAirtableDataModelFixture();

      // when
      const tube = dataModels.Tube.fromAirTableObject(tubeRawAirTableFixture());

      // then
      expect(tube).to.be.an.instanceof(dataModels.Tube);
      expect(tube).to.deep.equal(expectedTube);
    });
  });
});
