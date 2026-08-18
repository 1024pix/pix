import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class CombinedCourseBlueprint extends Model {
  @attr('string') name;
  @attr('string') internalName;
  @attr('nullable-string') illustration;
  @attr('nullable-string') description;
  @attr('nullable-string') prescriberDescription;
  @attr('string') attestationLabel;
  @attr() rewardId;
  @attr('nullable-string') rewardRequirementsDescription;
  @attr('nullable-string') rewardType;
  @attr('nullable-string') surveyLink;
  @attr({ type: 'date', defaultValue: () => undefined }) createdAt;
  @attr({ defaultValue: () => [] }) content;
  @attr() cappedTubeRequirements;

  @hasMany('reward-requirement', { async: true, inverse: null }) rewardRequirements;
}
