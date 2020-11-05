const ORGANIZATION_LOGO_URL_HEIGHT = 70;
const ORGANIZATION_LOGO_URL_WIDTH = 70;

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
      height: ORGANIZATION_LOGO_URL_HEIGHT,
      width: ORGANIZATION_LOGO_URL_WIDTH,
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
