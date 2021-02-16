const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignToJoin = require('../../../../lib/domain/read-models/CampaignToJoin');
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
  type = Campaign.types.ASSESSMENT,
  isForAbsoluteNovice = false,
  organizationId = 2,
  organizationName = 'NomOrga',
  organizationType = types.PRO,
  organizationLogoUrl = 'baseCodeOrgaLogoImage',
  organizationIsManagingStudents = false,
  organizationIsPoleEmploi = false,
  targetProfileName = 'Le profil cible',
  targetProfileImageUrl = 'targetProfileImageUrl',
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
    isForAbsoluteNovice,
    organizationId,
    organizationName,
    organizationType,
    organizationLogoUrl,
    organizationIsManagingStudents,
    organizationIsPoleEmploi,
    targetProfileName,
    targetProfileImageUrl,
  });
};
