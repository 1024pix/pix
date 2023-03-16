import Model, { attr, belongsTo } from '@ember-data/model';

export default class OrganizationLearnerParticipation extends Model {
  @attr('string') campaignType;
  @attr('string') campaignName;
  @attr('date') createdAt;
  @attr('date') sharedAt;
  @attr('string') status;
  @attr('number') campaignId;

  @belongsTo('OrganizationLearnerActivity') organizationLearnerActivity;
}
