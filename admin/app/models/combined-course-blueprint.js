import Model, { attr } from '@ember-data/model';

export default class CombinedCourseBlueprint extends Model {
  @attr('string') name;
  @attr('string') internalName;
  @attr('string') illustration;
  @attr('string') description;
  @attr('string') attestationLabel;
  @attr() rewardId;
  @attr('string') rewardType;
  @attr('string') surveyLink;
  @attr({ type: 'date', defaultValue: () => undefined }) createdAt;
  @attr({ defaultValue: () => [] }) content;
}
