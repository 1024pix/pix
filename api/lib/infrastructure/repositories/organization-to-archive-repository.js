const { knex } = require('../../../db/knex-database-connection');
const { MissingAttributesError } = require('../../domain/errors');

module.exports = {
  async save(organizationToArchive) {
    if (!organizationToArchive.archiveDate || !organizationToArchive.archivedBy) {
      throw new MissingAttributesError();
    }

    if (organizationToArchive.newInvitationStatus) {
      await knex('organization-invitations')
        .where({ organizationId: organizationToArchive.id, status: organizationToArchive.previousInvitationStatus })
        .update({ status: organizationToArchive.newInvitationStatus });
    }

    await knex('campaigns')
      .where({ organizationId: organizationToArchive.id, archivedAt: null })
      .update({ archivedAt: organizationToArchive.archiveDate });

    await knex('memberships')
      .where({ organizationId: organizationToArchive.id, disabledAt: null })
      .update({ disabledAt: organizationToArchive.archiveDate });

    await knex('organizations')
      .where({ id: organizationToArchive.id, archivedBy: null })
      .update({ archivedBy: organizationToArchive.archivedBy, archivedAt: organizationToArchive.archiveDate });
  },
};
