function findPaginatedFilteredLearners(schema, request) {
  const {
    'page[number]': page,
    'page[size]': pageSize,
    'filter[organizationLearnerId]': organizationLearnerId,
    'filter[organizationExternalId]': organizationExternalId,
    'filter[fullName]': fullName,
    'filter[hideDisabled]': hideDisabled,
  } = request.queryParams;

  let adminOrganizationLearners = schema.adminOrganizationLearners.all().models;

  if (organizationLearnerId) {
    adminOrganizationLearners = adminOrganizationLearners.filter((learner) => learner.id === organizationLearnerId);
  }

  if (organizationExternalId) {
    const organizationId = schema.organizations.where({ organizationExternalId: organizationExternalId }).models?.id;
    adminOrganizationLearners = adminOrganizationLearners.filter(
      (learner) => learner.organizationId === organizationId,
    );
  }

  if (fullName) {
    adminOrganizationLearners = adminOrganizationLearners.filter(
      (learner) => learner.firstName.includes(fullName) || learner.lastName.includes(fullName),
    );
  }

  if (hideDisabled) {
    adminOrganizationLearners = adminOrganizationLearners.filter((learner) => !learner.isDisabled);
  }

  const json = this.serialize(
    { modelName: 'admin-organization-learner', models: adminOrganizationLearners },
    'admin-organization-learner',
  );

  json.meta = {
    page,
    pageSize,
    rowCount: adminOrganizationLearners.length,
    pageCount: Math.ceil(adminOrganizationLearners.length.length / pageSize),
  };
  return json;
}

export { findPaginatedFilteredLearners };
