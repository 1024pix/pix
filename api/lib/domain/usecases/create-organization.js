const Organization = require('../models/Organization');
const organizationCreationValidator = require('../validators/organization-creation-validator');

module.exports = async function createOrganization({
  name,
  type,
  logoUrl,
  externalId,
  provinceCode,
  organizationRepository,
  imageUtils,
}) {
  organizationCreationValidator.validate({ name, type });
  let organizationLogoUrl = logoUrl;
  if (organizationLogoUrl) {
    const { scaledDownImage } = await imageUtils.scaleDownBase64FormattedImage({
      originImage: logoUrl,
      height: Organization.logoDimensions.HEIGHT,
      width: Organization.logoDimensions.WIDTH,
    });
    organizationLogoUrl = scaledDownImage;
  }
  const organization = new Organization({ name, type, logoUrl: organizationLogoUrl, externalId, provinceCode });
  return organizationRepository.create(organization);
};
