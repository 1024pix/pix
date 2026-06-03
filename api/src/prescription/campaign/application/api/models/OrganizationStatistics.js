export class OrganizationStatistics {
  constructor({ organizationId, totalParticipantsCount, totalParticipantsCountByYear }) {
    this.organizationId = organizationId;
    this.totalParticipantsCount = totalParticipantsCount;
    this.totalParticipantsCountByYear = totalParticipantsCountByYear;
  }
}
