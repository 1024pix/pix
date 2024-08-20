export class GarAnonymizedBatchEventsLoggingJob {
  constructor({ userIds, updatedByUserId, client = 'PIX_ADMIN', role }) {
    this.userIds = userIds;
    this.updatedByUserId = updatedByUserId;
    this.client = client;
    this.role = role;
    this.occurredAt = new Date();
  }
}
