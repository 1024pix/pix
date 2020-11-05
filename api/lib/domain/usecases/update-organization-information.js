const { logoDimensions } = require('../models/Organization');

module.exports = async function updateOrganizationInformation({
  id,
  name,
  type,
  logoUrl,
  externalId,
  provinceCode,
  isManagingStudents,
  canCollectProfiles,
  email,
  credit,
  organizationRepository,
  imageUtils,
}) {
  const organization = await organizationRepository.get(id);

  if (name) organization.name = name;
  if (type) organization.type = type;
  if (logoUrl) {
    const { scaledDownImage } = await imageUtils.scaleDownBase64FormattedImage({
      originImage: logoUrl,
      height: logoDimensions.HEIGHT,
      width: logoDimensions.WIDTH,
    });
    organization.logoUrl = scaledDownImage;
  }
  organization.email = email;
  organization.credit = credit;
  organization.externalId = externalId;
  organization.provinceCode = provinceCode;
  organization.isManagingStudents = isManagingStudents;
  organization.canCollectProfiles = canCollectProfiles;

  await organizationRepository.update(organization);

  return organization;
};
