export class ResetPasswordDemand {
  /**
   * @param {{
   *   id: string,
   *   email: string,
   *   temporaryKey: string,
   *   used: boolean,
   *   createdAt: Date,
   *   updatedAt: Date,
   * }} data
   */
  constructor(data) {
    this.createdAt = data.createdAt;
    this.email = data.email;
    this.id = data.id;
    this.temporaryKey = data.temporaryKey;
    this.updatedAt = data.updatedAt;
    this.used = data.used;
  }
}
