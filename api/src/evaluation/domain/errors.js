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

class AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError extends DomainError {
  constructor() {
    super('Autonomous course requires a target profile with simplified access.');
  }
}

class TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization extends DomainError {
  constructor() {
    super('Target profile requires to be linked to autonomous course organization.');
  }
}

export {
  AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  DomainError,
  StageWithLinkedCampaignError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
};
