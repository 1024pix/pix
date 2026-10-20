class OrganizationProfileReward {
  constructor({ id, organizationId, profileRewardId, userId, obtainedAt }) {
    this.id = id;
    this.profileRewardId = profileRewardId;
    this.organizationId = organizationId;
    this.userId = userId;
    this.obtainedAt = obtainedAt;
  }
}

export { OrganizationProfileReward };
