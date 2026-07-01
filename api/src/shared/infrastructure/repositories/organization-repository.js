import { Organization } from '../../../organizational-entities/domain/models/Organization.js';
import { Tag } from '../../../organizational-entities/domain/models/Tag.js';
import { ORGANIZATION_FEATURE } from '../../../shared/constants.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { NotFoundError } from '../../domain/errors.js';

const ORGANIZATIONS_TABLE_NAME = 'organizations';

function _toDomain(rawOrganization) {
  const organization = new Organization({
    id: rawOrganization.id,
    name: rawOrganization.name,
    type: rawOrganization.type,
    logoUrl: rawOrganization.logoUrl,
    externalId: rawOrganization.externalId,
    provinceCode: rawOrganization.provinceCode,
    isManagingStudents: Boolean(rawOrganization.isManagingStudents),
    identityProviderForCampaigns: rawOrganization.identityProviderForCampaigns,
    credit: rawOrganization.credit,
    email: rawOrganization.email,
    documentationUrl: rawOrganization.documentationUrl,
    createdBy: rawOrganization.createdBy,
    showNPS: rawOrganization.showNPS,
    formNPSUrl: rawOrganization.formNPSUrl,
    showSkills: rawOrganization.showSkills,
    archivedAt: rawOrganization.archivedAt,
  });

  organization.targetProfileShares = rawOrganization.targetProfileShares || [];
  organization.tags = rawOrganization.tags || [];

  return organization;
}

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();

  const organizationDB = await knexConn(ORGANIZATIONS_TABLE_NAME).where({ id }).first();
  if (!organizationDB) {
    throw new NotFoundError(`Not found organization for ID ${id}`);
  }

  const tagsDB = await knexConn('tags')
    .select(['tags.id', 'tags.name'])
    .join('organization-tags', 'organization-tags.tagId', 'tags.id')
    .where('organization-tags.organizationId', id);

  const tags = tagsDB.map((tagDB) => new Tag(tagDB));
  return _toDomain({ ...organizationDB, tags });
};

const findActiveScoOrganizationsByExternalId = async function (externalId) {
  const knexConn = DomainTransaction.getConnection();
  const organizationsDB = await knexConn(ORGANIZATIONS_TABLE_NAME)
    .where({ archivedAt: null })
    .whereIn('type', [Organization.types.SCO, Organization.types.SCO1D])
    .whereRaw('LOWER("externalId") = ?', `${externalId.toLowerCase()}`);

  return organizationsDB.map((model) => _toDomain(model));
};

const getOrganizationsWithPlacesManagementFeatureEnabled = async function () {
  const knexConn = DomainTransaction.getConnection();
  const placesManagementFeature = await knexConn('features')
    .select('id')
    .where('key', ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key)
    .first();

  if (!placesManagementFeature) {
    return [];
  }

  const organizations = await knexConn('organizations')
    .select('organizations.id', 'name', 'type')
    .join('organization-features', function () {
      this.on('organization-features.organizationId', 'organizations.id').andOn(
        'organization-features.featureId',
        placesManagementFeature.id,
      );
    })
    .whereNull('archivedAt');

  return organizations.map((organization) => _toDomain(organization));
};

export { findActiveScoOrganizationsByExternalId, get, getOrganizationsWithPlacesManagementFeatureEnabled };
