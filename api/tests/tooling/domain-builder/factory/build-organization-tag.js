import OrganizationTag from '../../../../lib/domain/models/OrganizationTag';

export default function buildOrganizationTag({ id = 123, organizationId = 456, tagId = 789 } = {}) {
  return new OrganizationTag({ id, organizationId, tagId });
}
