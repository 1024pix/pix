class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class StageWithLinkedCampaignError extends DomainError {
  constructor() {
    super('The stage is part of a target profile linked to a campaign');
  }
}

export { DomainError, StageWithLinkedCampaignError };
