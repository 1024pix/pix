import Model, { attr } from '@ember-data/model';

export default class PublishableSessionModel extends Model {
  @attr() certificationCenterName;
  @attr() sessionDate;
  @attr() sessionTime;
  @attr() finalizedAt;
}
