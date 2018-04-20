const dataModels = require('../../../../../../lib/infrastructure/datasources/airtable/models/index');
const challengeRawAirTableFixture = require('../../../../../fixtures/infrastructure/challengeRawAirTableFixture');
const ChallengeAirtableDataModelFixture = require('../../../../../fixtures/infrastructure/ChallengeAirtableDataModelFixture');
const { expect } = require('../../../../../test-helper');

describe('Unit | Infrastructure | Datasource | Airtable | Model | Challenge', () => {

  context('#fromAirTableObject', () => {

    it('should create a Challenge from the AirtableRecord', () => {
      // given
      const expectedChallenge = ChallengeAirtableDataModelFixture();

      // when
      const challenge = dataModels.Challenge.fromAirTableObject(challengeRawAirTableFixture());

      // then
      expect(challenge).to.be.an.instanceof(dataModels.Challenge);
      expect(challenge).to.deep.equal(expectedChallenge);
    });
  });
});
