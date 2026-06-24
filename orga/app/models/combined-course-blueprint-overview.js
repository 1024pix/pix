import Model, { attr, hasMany } from '@ember-data/model';

export default class CombinedCourseBlueprintOverview extends Model {
  @attr('string') name;
  @attr('string') description;
  @attr('string') illustration;

  @hasMany('combined-course-blueprint-item', { async: false, inverse: null }) items;

  get steps() {
    let previousActivityType = null;
    const steps = [];
    let currentStep = null;
    for (const item of this.items) {
      if (item.type !== previousActivityType) {
        currentStep = { items: [], type: item.type };
        steps.push(currentStep);
      }
      currentStep.items.push(item);
      previousActivityType = item.type;
    }
    return steps;
  }
}
