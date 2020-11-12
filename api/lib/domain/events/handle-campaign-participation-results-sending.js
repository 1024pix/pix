const { checkEventType } = require('./check-event-type');
const CampaignParticipationResultsShared = require('./CampaignParticipationResultsShared');
const config = require('../../config');

const eventType = CampaignParticipationResultsShared;

const PAYLOAD_CAMPAIGN_TYPE = 'EVALUATION';
const PAYLOAD_STRUCTURE_NAME = 'Pix';
const PAYLOAD_STRUCTURE_TYPE = 'externe';
const PAYLOAD_CAMPAIGN_URL = `${config.domain.pixApp}${config.domain.tldFr}/campagnes`;
const PAYLOAD_TEST_STATE = { STARTED: 2, FINISHED: 3, SENT: 4 };
const PAYLOAD_UNITS = { PERCENTAGE: 'A', SCORE: 'B' };
const PAYLOAD_EVALUATION_CATEGORY = 'competence';
const PAYLOAD_EVALUATION_TYPE = 'competence Pix';

async function handleCampaignParticipationResultsSending({
  event,
  campaignRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  organizationRepository,
  userRepository,
}) {
  checkEventType(event, eventType);

  const { organizationId, campaignId, userId, campaignParticipationId } = event;

  const campaign = await campaignRepository.get(campaignId);
  const organization = await organizationRepository.get(organizationId);
  
  if (campaign.isAssessment() && organization.isPoleEmploi) {
    
    const user = await userRepository.get(userId);
    const participation = await campaignParticipationRepository.get(campaignParticipationId);
    const participationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId);

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
        referenceExterne: participation.id,
        dateDebut: participation.createdAt,
        dateProgression: participation.sharedAt,
        dateValidation: participation.sharedAt,
        evaluationCible: participationResult.masteryPercentage,
        uniteEvaluation: PAYLOAD_UNITS.PERCENTAGE,
        elementsEvalues: participationResult.competenceResults.map((competence) => ({
          libelle: competence.name,
          categorie: PAYLOAD_EVALUATION_CATEGORY,
          type: PAYLOAD_EVALUATION_TYPE,
          domaineRattachement: 'Information et données',
          nbSousElements: competence.totalSkillsCount,
          evaluation: {
            scoreObtenu: competence.masteryPercentage,
            uniteScore: PAYLOAD_UNITS.PERCENTAGE,
            nbSousElementValide: competence.validatedSkillsCount,
          },
        })),
      },
    };
    console.log(JSON.stringify(resultsToSend));
  }
}

handleCampaignParticipationResultsSending.eventType = eventType;
module.exports = handleCampaignParticipationResultsSending;
