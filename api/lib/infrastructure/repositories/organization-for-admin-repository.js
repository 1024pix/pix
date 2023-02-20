import { NotFoundError, MissingAttributesError } from '../../domain/errors';
import OrganizationForAdmin from '../../domain/models/OrganizationForAdmin';
import Tag from '../../domain/models/Tag';
import { knex } from '../../../db/knex-database-connection';
import OrganizationInvitation from '../../domain/models/OrganizationInvitation';
import _ from 'lodash';

const ORGANIZATIONS_TABLE_NAME = 'organizations';

function _toDomain(rawOrganization) {
  const organization = new OrganizationForAdmin({
    id: rawOrganization.id,
    name: rawOrganization.name,
    type: rawOrganization.type,
    logoUrl: rawOrganization.logoUrl,
    externalId: rawOrganization.externalId,
    provinceCode: rawOrganization.provinceCode,
    isManagingStudents: Boolean(rawOrganization.isManagingStudents),
    credit: rawOrganization.credit,
    email: rawOrganization.email,
    documentationUrl: rawOrganization.documentationUrl,
    createdBy: rawOrganization.createdBy,
    createdAt: rawOrganization.createdAt,
    showNPS: rawOrganization.showNPS,
    formNPSUrl: rawOrganization.formNPSUrl,
    showSkills: rawOrganization.showSkills,
    archivedAt: rawOrganization.archivedAt,
    archivistFirstName: rawOrganization.archivistFirstName,
    archivistLastName: rawOrganization.archivistLastName,
    dataProtectionOfficerFirstName: rawOrganization.dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName: rawOrganization.dataProtectionOfficerLastName,
    dataProtectionOfficerEmail: rawOrganization.dataProtectionOfficerEmail,
    creatorFirstName: rawOrganization.creatorFirstName,
    creatorLastName: rawOrganization.creatorLastName,
    identityProviderForCampaigns: rawOrganization.identityProviderForCampaigns,
  });

  organization.tags = rawOrganization.tags || [];

  return organization;
}

export default {
  async get(id) {
    const organization = await knex(ORGANIZATIONS_TABLE_NAME)
      .select({
        id: 'organizations.id',
        name: 'organizations.name',
        type: 'organizations.type',
        logoUrl: 'organizations.logoUrl',
        externalId: 'organizations.externalId',
        provinceCode: 'organizations.provinceCode',
        isManagingStudents: 'organizations.isManagingStudents',
        credit: 'organizations.credit',
        email: 'organizations.email',
        documentationUrl: 'organizations.documentationUrl',
        createdBy: 'organizations.createdBy',
        createdAt: 'organizations.createdAt',
        showNPS: 'organizations.showNPS',
        formNPSUrl: 'organizations.formNPSUrl',
        showSkills: 'organizations.showSkills',
        archivedAt: 'organizations.archivedAt',
        archivistFirstName: 'archivists.firstName',
        archivistLastName: 'archivists.lastName',
        dataProtectionOfficerFirstName: 'dataProtectionOfficers.firstName',
        dataProtectionOfficerLastName: 'dataProtectionOfficers.lastName',
        dataProtectionOfficerEmail: 'dataProtectionOfficers.email',
        creatorFirstName: 'creators.firstName',
        creatorLastName: 'creators.lastName',
        identityProviderForCampaigns: 'organizations.identityProviderForCampaigns',
      })
      .leftJoin('users AS archivists', 'archivists.id', 'organizations.archivedBy')
      .leftJoin('users AS creators', 'creators.id', 'organizations.createdBy')
      .leftJoin(
        'data-protection-officers AS dataProtectionOfficers',
        'dataProtectionOfficers.organizationId',
        'organizations.id'
      )
      .where('organizations.id', id)
      .first();

    if (!organization) {
      throw new NotFoundError(`Not found organization for ID ${id}`);
    }

    const tags = await knex('tags')
      .select('tags.*')
      .join('organization-tags', 'organization-tags.tagId', 'tags.id')
      .where('organization-tags.organizationId', organization.id);

    organization.tags = tags.map((tag) => {
      return new Tag(tag);
    });

    return _toDomain(organization);
  },

  async update(organization) {
    const organizationRawData = _.pick(organization, [
      'name',
      'type',
      'logoUrl',
      'externalId',
      'provinceCode',
      'isManagingStudents',
      'email',
      'credit',
      'documentationUrl',
      'showSkills',
      'identityProviderForCampaigns',
    ]);

    const [organizationDB] = await knex(ORGANIZATIONS_TABLE_NAME)
      .update(organizationRawData)
      .where({ id: organization.id })
      .returning('*');

    const tagsDB = await knex('tags')
      .select(['tags.id', 'tags.name'])
      .join('organization-tags', 'organization-tags.tagId', 'tags.id')
      .where('organization-tags.organizationId', organizationDB.id);
    const archivist = await knex('users')
      .select(['users.firstName', 'users.lastName'])
      .join('organizations', 'organizations.archivedBy', 'users.id')
      .where('organizations.id', organizationDB.id)
      .first();

    const tags = tagsDB.map((tagDB) => new Tag(tagDB));

    if (archivist) {
      organizationDB.archivistFirstName = archivist.firstName;
      organizationDB.archivistLastName = archivist.lastName;
    }

    return _toDomain({ ...organizationDB, tags });
  },

  async archive({ id, archivedBy }) {
    if (!archivedBy) {
      throw new MissingAttributesError();
    }

    const archiveDate = new Date();

    await knex('organization-invitations')
      .where({ organizationId: id, status: OrganizationInvitation.StatusType.PENDING })
      .update({ status: OrganizationInvitation.StatusType.CANCELLED, updatedAt: archiveDate });

    await knex('campaigns').where({ organizationId: id, archivedAt: null }).update({ archivedAt: archiveDate });

    await knex('memberships').where({ organizationId: id, disabledAt: null }).update({ disabledAt: archiveDate });

    await knex(ORGANIZATIONS_TABLE_NAME)
      .where({ id: id, archivedBy: null })
      .update({ archivedBy: archivedBy, archivedAt: archiveDate });
  },

  async save(organization) {
    const data = _.pick(organization, ['name', 'type', 'documentationUrl', 'credit', 'createdBy']);
    const [organizationCreated] = await knex(ORGANIZATIONS_TABLE_NAME).returning('*').insert(data);
    return _toDomain(organizationCreated);
  },
};
