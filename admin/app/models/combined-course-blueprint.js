import { service } from '@ember/service';
import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export const COMBINED_COURSE_ITEM_TYPES = {
  MODULE: 'module',
  CAMPAIGN: 'campaign',
  FORMATION: 'formation',
};

export const COMBINED_COURSE_DURATION_OPTIONS = {
  VERY_SHORT: 'very_short',
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
  VERY_LONG: 'very_long',
};

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
  @attr('nullable-string') durationSpan;
  @attr({ type: 'date', defaultValue: () => undefined }) createdAt;
  @attr({ defaultValue: () => [] }) content;
  @attr() cappedTubeRequirements;

  @hasMany('reward-requirement', { async: true, inverse: null }) rewardRequirements;

  @service intl;

  get durationOptions() {
    const translationKeys = {
      VERY_SHORT: this.intl.t('components.combined-course-blueprints.combined-course-duration.options.very-short'),
      SHORT: this.intl.t('components.combined-course-blueprints.combined-course-duration.options.short'),
      MEDIUM: this.intl.t('components.combined-course-blueprints.combined-course-duration.options.medium'),
      LONG: this.intl.t('components.combined-course-blueprints.combined-course-duration.options.long'),
      VERY_LONG: this.intl.t('components.combined-course-blueprints.combined-course-duration.options.very-long'),
    };

    return Object.entries(COMBINED_COURSE_DURATION_OPTIONS).map(([key, value]) => ({
      value,
      label: translationKeys[key],
    }));
  }

  get displayedDurationSpan() {
    return this.durationOptions.find(({ value }) => value === this.durationSpan).label;
  }
}
