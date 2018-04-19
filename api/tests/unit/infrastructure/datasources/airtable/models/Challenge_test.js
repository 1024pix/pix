const dataModels = require('../../../../../../lib/infrastructure/datasources/airtable/models/index');
const challengeRawAirTableFixture = require('../../../../../fixtures/infrastructure/challengeRawAirTableFixture');
const { expect } = require('../../../../../test-helper');

describe('Unit | Infrastructure | Datasource | Airtable | Model | Challenge', () => {

  context('when assessment is not completed', () => {

    it('should create a Challenge from the AirtableRecord', () => {
      // given
      const expectedChallenge = new dataModels.Challenge({
        id: 'recwWzTquPlvIl4So',
        instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
        proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
        type: 'QCM',
        solution: '1, 5',
        t1Status: 'Activé',
        t2Status: 'Activé',
        t3Status: 'Activé',
        scoring: '1: @outilsTexte2\n2: @outilsTexte4',
        status: 'validé',
        skillIds: ['recUDrCWD76fp5MsE']
      });

      // when
      const challenge = dataModels.Challenge.fromAirTableObject(challengeRawAirTableFixture);

      // then
      expect(challenge).to.be.an.instanceof(dataModels.Challenge);
      expect(challenge).to.deep.equal(expectedChallenge);
    });
  });
});
