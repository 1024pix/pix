function findPaginatedFilteredLearners(schema) {
  const adminOrganizationLearners = schema.adminOrganizationLearners.all().models;
  const json = this.serialize(
    { modelName: 'admin-organization-learner', models: adminOrganizationLearners },
    'admin-organization-learner',
  );
  json.meta = {
    page: 1,
    pageSize: 5,
    rowCount: 5,
    pageCount: 1,
  };
  return json;
}

export { findPaginatedFilteredLearners };
