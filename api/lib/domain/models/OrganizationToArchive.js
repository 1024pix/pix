const OrganizationInvitation = require('./OrganizationInvitation');

class OrganizationToArchive {
  constructor({ id } = {}) {
    this.id = id;
  }

  archive({ archiveDate = new Date(), archivedBy } = {}) {
    this.previousInvitationStatus = OrganizationInvitation.StatusType.PENDING;
    this.newInvitationStatus = OrganizationInvitation.StatusType.CANCELLED;
    this.archiveDate = archiveDate;
    this.archivedBy = archivedBy;
  }
}

module.exports = OrganizationToArchive;
