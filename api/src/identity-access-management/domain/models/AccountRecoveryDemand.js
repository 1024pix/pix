export class AccountRecoveryDemand {
  /**
   * @param {{
   *   id: string,
   *   userId: string,
   *   organizationLearnerId: string,
   *   oldEmail: string,
   *   newEmail: string,
   *   temporaryKey: string,
   *   used: boolean,
   *   createdAt: string|Date,
   * }} data
   */
  constructor({ id, userId, organizationLearnerId, oldEmail, newEmail, temporaryKey, used, createdAt } = {}) {
    this.id = id;
    this.organizationLearnerId = organizationLearnerId;
    this.userId = userId;
    this.oldEmail = oldEmail;
    this.newEmail = newEmail.toLowerCase();
    this.temporaryKey = temporaryKey;
    this.used = used;
    this.createdAt = createdAt;
  }
}
