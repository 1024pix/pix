import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { Membership, Organization, User } from '../../domain/models/index.js';

const ORGANIZATION_TAGS_TABLE = 'organization-tags';
const ORGANIZATIONS_TABLE = 'organizations';
const MEMBERSHIPS_TABLE = 'memberships';

export const findByUserId = async function ({ userId }) {
  const knexConnection = DomainTransaction.getConnection();

  const memberships = await knexConnection(MEMBERSHIPS_TABLE).where({ userId, disabledAt: null });
  const membershipOrganizationIds = memberships.map(({ organizationId }) => organizationId);
  const relatedOrganizations = await knexConnection(ORGANIZATIONS_TABLE).whereIn('id', membershipOrganizationIds);

  return memberships.map((membership) => {
    const organization = relatedOrganizations.find(({ id }) => id === membership.organizationId);
    return toDomain(membership, null, organization);
  });
};

export const findByUserIdAndOrganizationId = async ({ userId, organizationId, includeOrganization = false }) => {
  const knexConnection = DomainTransaction.getConnection();
  const memberships = await knexConnection(MEMBERSHIPS_TABLE).where({ userId, organizationId, disabledAt: null });

  if (!includeOrganization) {
    return memberships.map(toDomain);
  }
  const membershipOrganizationIds = memberships.map(({ organizationId }) => organizationId);
  const organizations = await knexConnection(ORGANIZATIONS_TABLE).whereIn('id', membershipOrganizationIds);
  const organizationIds = organizations.map(({ id }) => id);
  const organizationsTags = await knexConnection(ORGANIZATION_TAGS_TABLE).whereIn('organizationId', organizationIds);

  return memberships.map((membership) => {
    const organization = organizations.find(({ id }) => id === membership.organizationId);
    const organizationTags = organizationsTags.filter(({ organizationId }) => organizationId === organization.id);
    return toDomain(membership, null, organization, organizationTags);
  });
};

const toDomain = (membershipData, userData = null, organizationData = null, organizationTags = null) => {
  const membership = new Membership(membershipData);
  if (userData) membership.user = new User(userData);
  if (organizationData) membership.organization = new Organization(organizationData);
  if (organizationTags) membership.organization.tags = organizationTags;
  return membership;
};
