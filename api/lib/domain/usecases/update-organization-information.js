module.exports = async function updateOrganizationInformation({
  id,
  name,
  type,
  logoUrl,
  externalId,
  provinceCode,
  organizationRepository
}) {
  const organization = await organizationRepository.get(id);

  if (name) organization.name = name;
  if (type) organization.type = type;
  if (logoUrl) organization.logoUrl = logoUrl;
  if (externalId) organization.externalId = externalId;
  if (provinceCode) organization.provinceCode = provinceCode;

  await organizationRepository.update(organization);

  return organization;
};
