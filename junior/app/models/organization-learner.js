import Model, { attr } from '@ember-data/model';

export default class OrganizationLearner extends Model {
  @attr firstName;
  @attr displayName;
  @attr organizationId;
  @attr division;
  @attr completedMissionIds;
  @attr startedMissionIds;
}
