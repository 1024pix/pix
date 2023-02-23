const _ = require('lodash');
const config = require('../../../config.js');

const CAMPAIGN_TYPE = 'EVALUATION';
const STRUCTURE_NAME = 'Pix';
const STRUCTURE_TYPE = 'externe';
const CAMPAIGN_URL = `${config.domain.pixApp}${config.domain.tldFr}/campagnes`;
const TEST_STATE = { STARTED: 2, FINISHED: 3, SHARED: 4 };
const UNITS = { PERCENTAGE: 'A', SCORE: 'B' };
const EVALUATION_CATEGORY = 'competence';
const EVALUATION_TYPE = 'competence Pix';
const PROGRESSION = { STARTED: 0, FINISHED: 100 };
const PROFILE_TYPES = { DI: 'DI', PC: 'PC', CP: 'CP' };

class PoleEmploiPayload {
  constructor({ individu, campagne, test, badges }) {
    this.individu = individu;
    this.campagne = campagne;
    this.test = test;
    this.badges = badges;
  }

  static buildForParticipationStarted({ user, campaign, targetProfile, participation }) {
    return new PoleEmploiPayload({
      individu: _buildIndividu({ user }),
      campagne: _buildCampaign({ campaign }),
      test: _buildTest({ etat: TEST_STATE.STARTED, targetProfile, participation }),
    });
  }

  static buildForParticipationFinished({ user, campaign, targetProfile, participation, assessment }) {
    return new PoleEmploiPayload({
      individu: _buildIndividu({ user }),
      campagne: _buildCampaign({ campaign }),
      test: _buildTest({ etat: TEST_STATE.FINISHED, targetProfile, participation, assessment }),
    });
  }

  static buildForParticipationShared({
    user,
    campaign,
    targetProfile,
    participation,
    participationResult,
    badges,
    badgeAcquiredIds,
  }) {
    return new PoleEmploiPayload({
      individu: _buildIndividu({ user }),
      campagne: _buildCampaign({ campaign }),
      test: _buildTest({ etat: TEST_STATE.SHARED, targetProfile, participation, participationResult }),
      badges: _buildBadge({ badges, badgeAcquiredIds }),
    });
  }

  toString() {
    return JSON.stringify({
      campagne: this.campagne,
      individu: this.individu,
      test: this.test,
      badges: this.badges,
    });
  }
}

function _buildBadge({ badges, badgeAcquiredIds }) {
  return badges.map((badge) => {
    return {
      cle: badge.key,
      titre: badge.title,
      message: badge.message,
      imageUrl: badge.imageUrl,
      messageAlternatif: badge.altMessage,
      certifiable: badge.isCertifiable,
      obtenu: badgeAcquiredIds.includes(badge.id),
    };
  });
}

function _buildIndividu({ user }) {
  return {
    nom: user.lastName,
    prenom: user.firstName,
  };
}

function _buildCampaign({ campaign }) {
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

function _buildTest({ etat, targetProfile, participation, participationResult, assessment }) {
  let progression = null;
  let dateProgression = null;
  let dateValidation = null;
  let evaluation = null;
  let elementsEvalues = [];

  switch (etat) {
    case TEST_STATE.STARTED:
      progression = PROGRESSION.STARTED;
      break;
    case TEST_STATE.FINISHED:
      progression = PROGRESSION.FINISHED;
      dateProgression = assessment.updatedAt;
      break;
    case TEST_STATE.SHARED:
      progression = PROGRESSION.FINISHED;
      dateProgression = participation.sharedAt;
      dateValidation = participation.sharedAt;
      evaluation = participationResult.masteryPercentage;
      elementsEvalues = _.map(participationResult.competenceResults, _buildElementEvalue);
      break;
  }

  return {
    etat,
    progression,
    typeTest: _getTypeTest(targetProfile.name),
    referenceExterne: participation.id,
    dateDebut: participation.createdAt,
    dateProgression,
    dateValidation,
    evaluation,
    uniteEvaluation: UNITS.PERCENTAGE,
    elementsEvalues,
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
    return PROFILE_TYPES.DI;
  } else if (targetProfileName.includes('Parcours complet')) {
    return PROFILE_TYPES.PC;
  }
  return PROFILE_TYPES.CP;
}

module.exports = PoleEmploiPayload;
