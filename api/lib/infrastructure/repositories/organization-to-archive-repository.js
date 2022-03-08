const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  async save(organizationToArchive) {
    if (organizationToArchive.newInvitationStatus) {
      await knex('organization-invitations')
        .where({ organizationId: organizationToArchive.id, status: organizationToArchive.previousInvitationStatus })
        .update({ status: organizationToArchive.newInvitationStatus });
    }

    if (organizationToArchive.archiveDate) {
      await knex('campaigns')
        .where({ organizationId: organizationToArchive.id, archivedAt: null })
        .update({ archivedAt: organizationToArchive.archiveDate });
    }
  },
};
