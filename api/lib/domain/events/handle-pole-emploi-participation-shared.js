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
const PAYLOAD_PROGRESSION = { FINISHED: 100 };

class PoleEmploiPayload {
  constructor({ user, campaign, targetProfile, participation, participationResult }) {
    this.individu = this._buildIndividu(user);
    this.campagne = this._buildCampaign(campaign);
    this.test = this._buildTest(targetProfile, participation, participationResult);
  }

  toString() {
    return JSON.stringify({
      campagne: this.campagne,
      individu: this.individu,
      test: this.test,
    });
  }

  _buildIndividu(user) {
    return {
      nom: user.lastName,
      prenom: user.firstName,
    };
  }

  _buildCampaign(campaign) {
    return {
      nom: campaign.name,
      dateDebut: campaign.createdAt,
      dateFin: campaign.archivedAt,
      type: PAYLOAD_CAMPAIGN_TYPE,
      codeCampagne: campaign.code,
      urlCampagne: `${PAYLOAD_CAMPAIGN_URL}/${campaign.code}`,
      nomOrganisme: PAYLOAD_STRUCTURE_NAME,
      typeOrganisme: PAYLOAD_STRUCTURE_TYPE,
    };
  }

  _buildTest(targetProfile, participation, participationResult) {
    return {
      etat: PAYLOAD_TEST_STATE.SENT,
      progression: PAYLOAD_PROGRESSION.FINISHED,
      typeTest: this._getTypeTest(targetProfile.name),
      referenceExterne: participation.id,
      dateDebut: participation.createdAt,
      dateProgression: participation.sharedAt,
      dateValidation: participation.sharedAt,
      evaluation: participationResult.masteryPercentage,
      uniteEvaluation: PAYLOAD_UNITS.PERCENTAGE,
      elementsEvalues: participationResult.competenceResults.map(this._buildElementEvalue),
    };
  }

  _buildElementEvalue(competence) {
    return {
      libelle: competence.name,
      categorie: PAYLOAD_EVALUATION_CATEGORY,
      type: PAYLOAD_EVALUATION_TYPE,
      domaineRattachement: competence.areaName,
      nbSousElements: competence.totalSkillsCount,
      evaluation: {
        scoreObtenu: competence.masteryPercentage,
        uniteScore: PAYLOAD_UNITS.PERCENTAGE,
        nbSousElementValide: competence.validatedSkillsCount,
      },
    };
  }

  _getTypeTest(targetProfileName) {
    if (targetProfileName.includes('Diagnostic initial')) {
      return 'DI';
    } else if (targetProfileName.includes('Parcours complet')) {
      return 'PC';
    }
    return 'CP';
  }
}

async function handlePoleEmploiParticipationShared({
  event,
  campaignRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  organizationRepository,
  targetProfileRepository,
  userRepository,
}) {
  checkEventType(event, eventType);

  const { organizationId, campaignId, userId, campaignParticipationId } = event;

  const campaign = await campaignRepository.get(campaignId);
  const organization = await organizationRepository.get(organizationId);

  if (campaign.isAssessment() && organization.isPoleEmploi) {

    const user = await userRepository.get(userId);
    const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
    const participation = await campaignParticipationRepository.get(campaignParticipationId);
    const participationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId);

    const payload = new PoleEmploiPayload({
      user,
      campaign,
      targetProfile,
      participation,
      participationResult,
    });

    console.log(payload.toString());
  }
}

handlePoleEmploiParticipationShared.eventType = eventType;
module.exports = handlePoleEmploiParticipationShared;
