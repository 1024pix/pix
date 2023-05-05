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
 * @returns {{campaignId: number}}
 */
function createCampaign({
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
