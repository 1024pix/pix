import { databaseBuffer } from '../../../database-buffer.ts';

const buildOrganizationLearnerFilter = function ({ organizationId, attributeName, values } = {}) {
  const columns = {
    organization_id: organizationId,
    attribute_name: attributeName,
    values: JSON.stringify(values),
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization_learner_filters',
    values: columns,
  });
};

export { buildOrganizationLearnerFilter };
