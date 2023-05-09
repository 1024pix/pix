import { learningContent } from './learning-content.js';

export { createAssessmentCampaign, createProfilesCollectionCampaign };

/**
 * Fonction générique pour créer une campagne d'évaluation selon une configuration donnée.
 * Retourne l'ID de la campagne.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} campaignId
 * @param {string} name
 * @param {string} code
 * @param {string} title
 * @param {string} idPixLabel
 * @param {string} externalIdHelpImageUrl
 * @param {string} alternativeTextToExternalIdHelpImage
 * @param {string} customLandingPageText
 * @param {boolean} isForAbsoluteNovice
 * @param {Date} archivedAt
 * @param {number} archivedBy
 * @param {Date} createdAt
 * @param {number} organizationId
 * @param {number} creatorId
 * @param {number} ownerId
 * @param {number} targetProfileId
 * @param {string} customResultPageText
 * @param {string} customResultPageButtonText
 * @param {string} customResultPageButtonUrl
 * @param {boolean} multipleSendings
 * @param {string} assessmentMethod
 * @returns {Promise<{campaignId: number}>}
 */
async function createAssessmentCampaign({
  databaseBuilder,
  campaignId,
  name,
  code,
  title,
  idPixLabel,
  externalIdHelpImageUrl,
  alternativeTextToExternalIdHelpImage,
  customLandingPageText,
  isForAbsoluteNovice,
  archivedAt,
  archivedBy,
  createdAt,
  organizationId,
  creatorId,
  ownerId,
  targetProfileId,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  assessmentMethod,
}) {
  _buildCampaign({
    databaseBuilder,
    campaignId,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    isForAbsoluteNovice,
    archivedAt,
    archivedBy,
    type: 'ASSESSMENT',
    createdAt,
    organizationId,
    creatorId,
    ownerId,
    targetProfileId,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
  });
  const cappedTubes = await databaseBuilder
    .knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where({ targetProfileId });
  for (const cappedTube of cappedTubes) {
    const skillsForTube = await learningContent.findActiveSkillsByTubeId(cappedTube.id);
    const skillsCapped = skillsForTube.filter((skill) => skill.difficulty <= parseInt(cappedTube.level));
    skillsCapped.map((skill) => databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skill.id }));
  }
  return { campaignId };
}

/**
 * Fonction générique pour créer une campagne de collecte de profils selon une configuration donnée.
 * Retourne l'ID de la campagne.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} campaignId
 * @param {string} name
 * @param {string} code
 * @param {string} title
 * @param {string} idPixLabel
 * @param {string} externalIdHelpImageUrl
 * @param {string} alternativeTextToExternalIdHelpImage
 * @param {string} customLandingPageText
 * @param {boolean} isForAbsoluteNovice
 * @param {Date} archivedAt
 * @param {number} archivedBy
 * @param {Date} createdAt
 * @param {number} organizationId
 * @param {number} creatorId
 * @param {number} ownerId
 * @param {string} customResultPageText
 * @param {string} customResultPageButtonText
 * @param {string} customResultPageButtonUrl
 * @param {boolean} multipleSendings
 * @param {string} assessmentMethod
 * @returns {Promise<{campaignId: number}>}
 */
async function createProfilesCollectionCampaign({
  databaseBuilder,
  campaignId,
  name,
  code,
  title,
  idPixLabel,
  externalIdHelpImageUrl,
  alternativeTextToExternalIdHelpImage,
  customLandingPageText,
  isForAbsoluteNovice,
  archivedAt,
  archivedBy,
  createdAt,
  organizationId,
  creatorId,
  ownerId,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  assessmentMethod,
}) {
  _buildCampaign({
    databaseBuilder,
    campaignId,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    isForAbsoluteNovice,
    archivedAt,
    archivedBy,
    type: 'PROFILES_COLLECTION',
    createdAt,
    organizationId,
    creatorId,
    ownerId,
    targetProfileId: null,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
  });
  return { campaignId };
}

function _buildCampaign({
  databaseBuilder,
  campaignId,
  name,
  code,
  title,
  idPixLabel,
  externalIdHelpImageUrl,
  alternativeTextToExternalIdHelpImage,
  customLandingPageText,
  isForAbsoluteNovice,
  archivedAt,
  archivedBy,
  type,
  createdAt,
  organizationId,
  creatorId,
  ownerId,
  targetProfileId,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  assessmentMethod,
}) {
  databaseBuilder.factory.buildCampaign({
    id: campaignId,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    isForAbsoluteNovice,
    archivedAt,
    archivedBy,
    type,
    createdAt,
    organizationId,
    creatorId,
    ownerId,
    targetProfileId,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
  });
}
