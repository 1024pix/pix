const CampaignToJoin = require('../../../../lib/domain/models/CampaignToJoin');
const { types } = require('../../../../lib/domain/models/Organization');

module.exports = function buildCampaignToJoin({
  id = 1,
  code = 'AZERTY123',
  title = 'Un titre de campagne',
  idPixLabel = 'Un id pix label',
  customLandingPageText = 'Une custom landing page',
  externalIdHelpImageUrl = 'baseCodeExternalIdImage',
  alternativeTextToExternalIdHelpImage = 'Une aide pour id externe',
  archivedAt = null,
  type = CampaignToJoin.types.ASSESSMENT,
  organizationId = 2,
  organizationName = 'NomOrga',
  organizationType = types.PRO,
  organizationIsManagingStudents = false,
  targetProfileId = 456,
  targetProfileName = 'Le profil cible',
} = {}) {
  return new CampaignToJoin({
    id,
    code,
    title,
    idPixLabel,
    customLandingPageText,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    archivedAt,
    type,
    organizationId,
    organizationName,
    organizationType,
    organizationIsManagingStudents,
    targetProfileId,
    targetProfileName,
  });
};
