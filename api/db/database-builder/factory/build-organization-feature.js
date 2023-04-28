const databaseBuffer = require('../database-buffer');

const buildOrganizationFeature = function buildOrganizationFeature({
  id = databaseBuffer.getNextId(),
  organizationId,
  featureId,
} = {}) {
  const values = {
    id,
    organizationId,
    featureId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-features',
    values,
  });
};

module.exports = buildOrganizationFeature;
