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

  static formatDuration({ locale, duration }) {
    const { days, hours, minutes } = duration || {};

    if (!days && !hours && !minutes) {
      return '';
    }

    let options = { style: 'narrow' };

    if (days) {
      options = { style: 'long', ...(hours && { hours: 'narrow' }), ...(minutes && { minutes: 'narrow' }) };
    }

    const formatter = new Intl.DurationFormat(locale, options);
    const result = formatter.format({ days, hours, minutes });
    const resultWithWhitespaceRemoved = result.replaceAll(' ', '');

    return days ? result : resultWithWhitespaceRemoved;
  }
}
