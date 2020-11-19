const config = require('../../../config');

const CAMPAIGN_TYPE = 'EVALUATION';
const STRUCTURE_NAME = 'Pix';
const STRUCTURE_TYPE = 'externe';
const CAMPAIGN_URL = `${config.domain.pixApp}${config.domain.tldFr}/campagnes`;
const TEST_STATE = { STARTED: 2, FINISHED: 3, SHARED: 4 };
const UNITS = { PERCENTAGE: 'A', SCORE: 'B' };
const EVALUATION_CATEGORY = 'competence';
const EVALUATION_TYPE = 'competence Pix';
const PROGRESSION = { STARTED: 0, FINISHED: 100 };

class PoleEmploiPayload {
  constructor({ individu, campagne, test }) {
    this.individu = individu;
    this.campagne = campagne;
    this.test = test;
  }

  static buildForParticipationShared({ user, campaign, targetProfile, participation, participationResult }) {
    return new PoleEmploiPayload({ 
      individu: _buildIndividu(user),
      campagne: _buildCampaign(campaign),
      test: _buildTest(TEST_STATE.SHARED, targetProfile, participation, participationResult),
    });
  }

  toString() {
    return JSON.stringify({
      campagne: this.campagne,
      individu: this.individu,
      test: this.test,
    });
  }
}

function _buildIndividu(user) {
  return {
    nom: user.lastName,
    prenom: user.firstName,
  };
}

function _buildCampaign(campaign) {
  return {
    nom: campaign.name,
    dateDebut: campaign.createdAt,
    dateFin: campaign.archivedAt,
    type: CAMPAIGN_TYPE,
    codeCampagne: campaign.code,
    urlCampagne: `${CAMPAIGN_URL}/${campaign.code}`,
    nomOrganisme: STRUCTURE_NAME,
    typeOrganisme: STRUCTURE_TYPE,
  };
}

function _buildTest(etat, targetProfile, participation, participationResult) {
  return {
    etat,
    progression: PROGRESSION.FINISHED,
    typeTest: _getTypeTest(targetProfile.name),
    referenceExterne: participation.id,
    dateDebut: participation.createdAt,
    dateProgression: participation.sharedAt,
    dateValidation: participation.sharedAt,
    evaluation: participationResult.masteryPercentage,
    uniteEvaluation: UNITS.PERCENTAGE,
    elementsEvalues: participationResult.competenceResults.map(_buildElementEvalue),
  };
}

function _buildElementEvalue(competence) {
  return {
    libelle: competence.name,
    categorie: EVALUATION_CATEGORY,
    type: EVALUATION_TYPE,
    domaineRattachement: competence.areaName,
    nbSousElements: competence.totalSkillsCount,
    evaluation: {
      scoreObtenu: competence.masteryPercentage,
      uniteScore: UNITS.PERCENTAGE,
      nbSousElementValide: competence.validatedSkillsCount,
    },
  };
}

function _getTypeTest(targetProfileName) {
  if (targetProfileName.includes('Diagnostic initial')) {
    return 'DI';
  } else if (targetProfileName.includes('Parcours complet')) {
    return 'PC';
  }
  return 'CP';
}

module.exports = PoleEmploiPayload;
