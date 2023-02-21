import _ from 'lodash';
import { POLE_EMPLOI_CAMPAIGN_ID } from './campaigns-pro-builder';
import { PRO_POLE_EMPLOI_ID } from './organizations-pro-builder';

export default function poleEmploiSendingsBuilder({ databaseBuilder }) {
  const _generateStatus = () => {
    const possibleChoices = [
      { isSuccessful: true, responseCode: '200' },
      { isSuccessful: false, responseCode: '400' },
    ];
    return _.sample(possibleChoices);
  };

  const _generateDate = (index) => {
    const date = new Date('2019-12-01');
    return new Date(date.setDate(date.getDate() + index));
  };

  _.times(10, async (index) => {
    const user = await databaseBuilder.factory.buildUser({
      firstName: `FirstName-${index}`,
      lastName: `LastName-${index}`,
    });
    await databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
      userId: user.id,
      externalIdentifier: `externalUserId${user.id}`,
    });
    const organizationLearnerId = await databaseBuilder.factory.buildOrganizationLearner({
      organizationId: PRO_POLE_EMPLOI_ID,
    }).id;
    const campaignParticipationId = await databaseBuilder.factory.buildCampaignParticipation({
      userId: user.id,
      campaignId: POLE_EMPLOI_CAMPAIGN_ID,
      status: 'TO_SHARE',
      organizationLearnerId,
    }).id;
    await databaseBuilder.factory.buildAssessment({
      userId: user.id,
      campaignParticipationId,
      type: 'CAMPAIGN',
      state: 'completed',
      method: 'SMART_RANDOM',
    });
    await databaseBuilder.factory.poleEmploiSendingFactory.build({
      ..._generateStatus(),
      campaignParticipationId,
      type: 'CAMPAIGN_PARTICIPATION_START',
      createdAt: _generateDate(index),
      payload: {
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
          referenceExterne: campaignParticipationId,
          dateDebut: '2019-09-01T00:00:00.000Z',
          elementsEvalues: [],
        },
      },
    });
    await databaseBuilder.factory.poleEmploiSendingFactory.build({
      ..._generateStatus(),
      campaignParticipationId,
      type: 'CAMPAIGN_PARTICIPATION_COMPLETION',
      createdAt: _generateDate(index),
      payload: {
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
          etat: 3,
          typeTest: 'DI',
          referenceExterne: campaignParticipationId,
          dateDebut: '2019-09-01T00:00:00.000Z',
          elementsEvalues: [],
        },
      },
    });
  });
}
