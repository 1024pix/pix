import Model, { attr } from '@ember-data/model';

export default class TargetProfileSummary extends Model {
  @attr() name;
  @attr() isPublic;
  @attr() outdated;
  @attr() createdAt;
}
