import { OrganizationTag } from '../../../../src/shared/domain/models/OrganizationTag.js';

const buildOrganizationTag = function ({ id = 123, organizationId = 456, tagId = 789 } = {}) {
  return new OrganizationTag({ id, organizationId, tagId });
};

export { buildOrganizationTag };
