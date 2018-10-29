module.exports = async function updateOrganizationInformation(
  {
    id,
    name,
    type,
    logoUrl,
    organizationRepository
  }) {

  const organization = await organizationRepository.get(id);

  if (name) organization.name = name;
  if (type) organization.type = type;
  if (logoUrl) organization.logoUrl = logoUrl;

  await organizationRepository.update(organization);

  return organization;
};
