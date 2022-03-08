const OrganizationInvitation = require('./OrganizationInvitation');

class OrganizationToArchive {
  constructor({ id } = {}) {
    this.id = id;
  }

  archive({ archiveDate = new Date() } = {}) {
    this.previousInvitationStatus = OrganizationInvitation.StatusType.PENDING;
    this.newInvitationStatus = OrganizationInvitation.StatusType.CANCELLED;
    this.archiveDate = archiveDate;
  }
}

module.exports = OrganizationToArchive;
