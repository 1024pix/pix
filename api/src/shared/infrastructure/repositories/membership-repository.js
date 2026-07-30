import { Organization } from '../../../organizational-entities/domain/models/Organization.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { Membership } from '../../domain/models/Membership.js';

const ORGANIZATION_TAGS_TABLE = 'organization-tags';
const ORGANIZATIONS_TABLE = 'organizations';
const MEMBERSHIPS_TABLE = 'memberships';

export const findByUserIdAndOrganizationId = async ({ userId, organizationId, includeOrganization = false }) => {
  const knexConnection = DomainTransaction.getConnection();
  const memberships = await knexConnection(MEMBERSHIPS_TABLE).where({ userId, organizationId, disabledAt: null });

  if (!includeOrganization) {
    return memberships.map((membership) => toDomain(membership));
  }
  const membershipOrganizationIds = memberships.map(({ organizationId }) => organizationId);
  const organizations = await knexConnection(ORGANIZATIONS_TABLE).whereIn('id', membershipOrganizationIds);
  const organizationIds = organizations.map(({ id }) => id);
  const organizationsTags = await knexConnection(ORGANIZATION_TAGS_TABLE).whereIn('organizationId', organizationIds);

  return memberships.map((membership) => {
    const organization = organizations.find(({ id }) => id === membership.organizationId);
    const organizationTags = organizationsTags.filter(({ organizationId }) => organizationId === organization.id);
    return toDomain(membership, organization, organizationTags);
  });
};

const toDomain = (membershipData, organizationData = null, organizationTags = null) => {
  const membership = new Membership(membershipData);
  if (organizationData) membership.organization = new Organization(organizationData);
  if (organizationTags) membership.organization.tags = organizationTags;
  return membership;
};
