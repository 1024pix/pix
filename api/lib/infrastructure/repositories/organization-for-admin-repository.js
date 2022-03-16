const { NotFoundError, MissingAttributesError } = require('../../domain/errors');
const OrganizationForAdmin = require('../../domain/models/OrganizationForAdmin');
const Tag = require('../../domain/models/Tag');
const { knex } = require('../../../db/knex-database-connection');
const OrganizationInvitation = require('../../domain/models/OrganizationInvitation');

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
    showNPS: rawOrganization.showNPS,
    formNPSUrl: rawOrganization.formNPSUrl,
    showSkills: rawOrganization.showSkills,
    archivedAt: rawOrganization.archivedAt,
    archivistFirstName: rawOrganization.archivistFirstName,
    archivistLastName: rawOrganization.archivistLastName,
  });

  organization.tags = rawOrganization.tags || [];

  return organization;
}

module.exports = {
  async get(id) {
    const organization = await knex('organizations')
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
        showNPS: 'organizations.showNPS',
        formNPSUrl: 'organizations.formNPSUrl',
        showSkills: 'organizations.showSkills',
        archivedAt: 'organizations.archivedAt',
        archivistFirstName: 'users.firstName',
        archivistLastName: 'users.lastName',
      })
      .leftJoin('users', 'users.id', 'organizations.archivedBy')
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

  async archive({ id, archivedBy }) {
    if (!archivedBy) {
      throw new MissingAttributesError();
    }

    const archiveDate = new Date();

    await knex('organization-invitations')
      .where({ organizationId: id, status: OrganizationInvitation.StatusType.PENDING })
      .update({ status: OrganizationInvitation.StatusType.CANCELLED });

    await knex('campaigns').where({ organizationId: id, archivedAt: null }).update({ archivedAt: archiveDate });

    await knex('memberships').where({ organizationId: id, disabledAt: null }).update({ disabledAt: archiveDate });

    await knex('organizations')
      .where({ id: id, archivedBy: null })
      .update({ archivedBy: archivedBy, archivedAt: archiveDate });
  },
};
