import Model, { attr } from '@ember-data/model';

import { categories } from '../helpers/target-profile-categories';
export default class TargetProfileSummary extends Model {
  @attr() internalName;
  @attr() outdated;
  @attr() category;
  @attr() createdAt;
  @attr() isPartOfCombinedCourse;

  get translationKeyCategory() {
    return categories[this.category];
  }
}
