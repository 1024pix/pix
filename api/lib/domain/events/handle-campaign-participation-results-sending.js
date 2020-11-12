const { checkEventType } = require('./check-event-type');
const CampaignParticipationResultsShared = require('./CampaignParticipationResultsShared');
const config = require('../../config');

const eventType = CampaignParticipationResultsShared;

const PAYLOAD_CAMPAIGN_TYPE = 'EVALUATION';
const PAYLOAD_STRUCTURE_NAME = 'Pix';
const PAYLOAD_STRUCTURE_TYPE = 'externe';
const PAYLOAD_CAMPAIGN_URL = `${config.domain.pixApp}${config.domain.tldFr}/campagnes`;
const PAYLOAD_TEST_STATE = { STARTED: 2, FINISHED: 3, SENT: 4 };

async function handleCampaignParticipationResultsSending({
  event,
  campaignRepository,
  organizationRepository,
  userRepository,
}) {
  checkEventType(event, eventType);

  const { organizationId, campaignId, userId } = event;

  const campaign = await campaignRepository.get(campaignId);
  const organization = await organizationRepository.get(organizationId);
  
  if (campaign.isAssessment() && organization.isPoleEmploi) {
    
    const user = await userRepository.get(userId);
  
    const resultsToSend = {
      campagne: {
        nom: campaign.name,
        dateDebut: campaign.createdAt,
        dateFin: campaign.archivedAt,
        type: PAYLOAD_CAMPAIGN_TYPE,
        idCampagne: campaign.id,
        codeCampagne: campaign.code,
        urlCampagne: `${PAYLOAD_CAMPAIGN_URL}/${campaign.code}`,
        nomOrganisme: PAYLOAD_STRUCTURE_NAME,
        typeOrganisme: PAYLOAD_STRUCTURE_TYPE,
      },
      individu: {
        nom: user.lastName,
        prenom: user.firstName,
      },
      test: {
        etat: PAYLOAD_TEST_STATE.SENT,
        progression: 100,
        typeTest: 'DI',
        referenceExterne: 55667788,
        dateDebut: new Date('2020-01-02'),
        dateProgression: new Date('2020-01-03'),
        dateValidation: new Date('2020-01-03'),
        evaluationCible: 62.47,
        uniteEvaluation: 'A',
        elementsEvalues: [{
          libelle: 'Gérer des données',
          categorie: 'competence',
          type: 'competence Pix',
          domaineRattachement: 'Information et données',
          nbSousElements: 3,
          evaluation: {
            scoreObtenu: 66.6,
            uniteScore: 'A',
            nbSousElementValide: 2,
          },
        },
        {
          libelle: 'Gérer des données 2',
          categorie: 'competence 2',
          type: 'competence Pix 2',
          domaineRattachement: 'Information et données',
          nbSousElements: 5,
          evaluation: {
            scoreObtenu: 60.0,
            uniteScore: 'B',
            nbSousElementValide: 3,
          },
        }],
      },
    };
    console.log(JSON.stringify(resultsToSend));
  }
}

handleCampaignParticipationResultsSending.eventType = eventType;
module.exports = handleCampaignParticipationResultsSending;
