import { service } from '@ember/service';
import Model, { attr, belongsTo } from '@ember-data/model';

export default class Training extends Model {
  @attr('string') title;
  @attr('string') link;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() duration;
  @attr('string') editorName;
  @attr('string') editorLogoUrl;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() locales;
  @attr('string') status;
  @attr('string') type;
  @attr('string') deliveryMode;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() objectives;
  @attr('string') program;
  @attr('boolean') registrationRequired;
  @attr('string') description;
  @attr('boolean', { allowNull: true }) isRelevant;

  @belongsTo('campaign-participation', { async: true, inverse: 'trainings' }) campaignParticipation;

  get isAutoformation() {
    return this.type === 'autoformation';
  }

  get isElearning() {
    return this.type === 'e-learning';
  }

  get isHybrid() {
    return this.type === 'hybrid-training';
  }

  get isInPerson() {
    return this.type === 'in-person-training';
  }

  get isModulix() {
    return this.type === 'modulix';
  }

  get isTypeLinkedToALocation() {
    return this.isElearning || this.isHybrid || this.isInPerson;
  }

  get hasDuration() {
    return this.duration.days || this.duration.hours || this.duration.minutes;
  }

  get formattedDuration() {
    const daysPart = this.formattedDays;
    const timePart = this.formattedTime;

    if (daysPart && timePart)
      return `${daysPart} ${this.intl.t('pages.skill-review.recommended-engine.training-card.duration.and')} ${timePart}`;
    return daysPart || timePart;
  }

  get formattedDays() {
    const { days } = this.duration;

    return days
      ? `${days} ${this.intl.t('pages.skill-review.recommended-engine.training-card.duration.days', { count: days })}`
      : '';
  }

  get formattedTime() {
    const { hours, minutes } = this.duration;

    const formattedHours = hours
      ? `${hours}${this.intl.t('pages.skill-review.recommended-engine.training-card.duration.hours')}`
      : '';
    const formattedMinutes = minutes
      ? `${minutes}${this.intl.t('pages.skill-review.recommended-engine.training-card.duration.minutes')}`
      : '';
    return [formattedHours, formattedMinutes].filter(Boolean).join('');
  }

  @service intl;
}
