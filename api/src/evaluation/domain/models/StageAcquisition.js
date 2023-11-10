class StageAcquisition {
  /**
   *
   * @param {number} id
   * @param {number} userId
   * @param {number} stageId
   * @param {number} campaignParticipationId
   */
  constructor({ id, userId, stageId, campaignParticipationId }) {
    this.id = id;
    this.userId = userId;
    this.stageId = stageId;
    this.campaignParticipationId = campaignParticipationId;
  }
}

export { StageAcquisition };
