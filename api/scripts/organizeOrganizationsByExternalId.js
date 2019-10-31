function organizeOrganizationsByExternalId(data) {
  const organizationsByExternalId = {};

  data.forEach((organization) => {
    if (organization.attributes['external-id']) {
      organization.attributes['external-id'] = organization.attributes['external-id'].toUpperCase();
      organizationsByExternalId[organization.attributes['external-id']] = { id: organization.id, ...organization.attributes };
    }
  });

  return organizationsByExternalId;
}

module.exports = organizeOrganizationsByExternalId;
