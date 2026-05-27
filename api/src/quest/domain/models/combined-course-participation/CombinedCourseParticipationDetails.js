export class CombinedCourseParticipationDetails {
  constructor({
    id,
    firstName,
    lastName,
    status,
    division,
    group,
    updatedAt,
    createdAt,
    nbModules,
    nbCampaigns,
    nbModulesCompleted,
    nbCampaignsCompleted,
    hasFormationItem,
  }) {
    this.id = id;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.firstName = firstName;
    this.division = division;
    this.group = group;
    this.lastName = lastName;
    this.hasFormationItem = hasFormationItem;
    this.nbModules = nbModules;
    this.nbCampaigns = nbCampaigns;
    this.nbCampaignsCompleted = nbCampaignsCompleted;
    this.nbModulesCompleted = nbModulesCompleted;
  }
}
