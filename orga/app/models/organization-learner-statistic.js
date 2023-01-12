import Model, { attr, belongsTo } from '@ember-data/model';

export default class OrganizationLearnerStatistic extends Model {
  @attr('number') shared;
  @attr('number') started;
  @attr('number') to_share;
  @attr('number') total;

  @belongsTo('OrganizationLearnerActivity') organizationLearnerActivity;
}
