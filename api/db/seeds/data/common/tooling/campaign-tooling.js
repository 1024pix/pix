const learningContent = require('./learning-content');

module.exports = {
  createCampaign,
};

/**
 * Fonction générique pour créer une campagne selon une configuration donnée.
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
 * @param {string} type
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
async function createCampaign({
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
