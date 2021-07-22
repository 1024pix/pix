const _ = require('lodash');
const { POLE_EMPLOI_CAMPAIGN_ID } = require('./campaigns-builder');

module.exports = function poleEmploisSendingsBuilder({ databaseBuilder }) {
  const _generateStatus = () => {
    const possibleChoices = [{ isSuccessful: true, responseCode: '200' }, { isSuccessful: false, responseCode: '400' }];
    return _.sample(possibleChoices);
  };

  const _generateDate = (index) => {
    const date = new Date('2019-12-01');
    return new Date(date.setDate(date.getDate() + index));
  };

  _.times(300, async (index) => {
    const user = await databaseBuilder.factory.buildUser({ firstName: `FirstName-${index}`, lastName: `LastName-${index}` });
    await databaseBuilder.factory.buildAuthenticationMethod({ userId: user.id, identityProvider: 'POLE_EMPLOI', externalIdentifier: `externalUserId${user.id}` });
    const campaignParticipationId = await databaseBuilder.factory.buildCampaignParticipation({ userId: user.id, campaignId: POLE_EMPLOI_CAMPAIGN_ID }).id;
    await databaseBuilder.factory.poleEmploiSendingFactory.build({ ..._generateStatus(), campaignParticipationId, createdAt: _generateDate(index), payload: {
      campagne: {
        nom: 'Campagne PE',
        dateDebut: '2019-08-01T00:00:00.000Z',
        type: 'EVALUATION',
        codeCampagne: 'QWERTY789',
        urlCampagne: 'https://app.pix.fr/campagnes/QWERTY789',
        nomOrganisme: 'Pix',
        typeOrganisme: 'externe',
      },
      individu: {
        nom: user.lastName,
        prenom: user.firstName,
      },
      test: {
        etat: 2,
        typeTest: 'DI',
        referenceExterne: 123456,
        dateDebut: '2019-09-01T00:00:00.000Z',
        elementsEvalues: [],
      },
    } });
  });
};
