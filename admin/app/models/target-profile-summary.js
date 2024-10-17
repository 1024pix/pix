import Model, { attr } from '@ember-data/model';

import { categories } from '../helpers/target-profile-categories';
export default class TargetProfileSummary extends Model {
  @attr() name;
  @attr() outdated;
  @attr() category;
  @attr() createdAt;
  @attr() canDetach;

  get translationKeyCategory() {
    return categories[this.category];
  }
}
