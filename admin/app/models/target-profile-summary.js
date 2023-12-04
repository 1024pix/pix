import Model, { attr } from '@ember-data/model';

export default class TargetProfileSummary extends Model {
  @attr() name;
  @attr() outdated;
  @attr() createdAt;
  @attr() canDetach;
}
