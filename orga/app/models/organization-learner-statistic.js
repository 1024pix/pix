import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class OrganizationLearnerStatistic extends Model {
  @attr('number') shared;
  @attr('number') started;
  @attr('number') total;

  @belongsTo('organization-learner-activity', { async: true, inverse: 'organizationLearnerStatistics' })
  organizationLearnerActivity;
}
