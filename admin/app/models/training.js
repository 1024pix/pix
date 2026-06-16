import Model, { attr, hasMany } from '@ember-data/model';
import sortBy from 'lodash/sortBy';

import formatList from '../utils/format-select-options';

export const typeCategories = {
  webinaire: 'Webinaire',
  autoformation: "Parcours d'autoformation",
  'e-learning': 'Formation en ligne',
  'hybrid-training': 'Formation hybride',
  'in-person-training': 'Formation en présentiel',
  modulix: 'Module Pix',
  'external-service': 'Service externe',
};

export const optionsTypeList = formatList(typeCategories);

export const localeCategories = {
  fr: 'Francophone (fr)',
  'fr-fr': 'Franco-français (fr-fr)',
  en: 'Anglophone (en)',
};

export const optionsLocaleList = formatList(localeCategories);

export const deliveryModeCategories = {
  hybrid: 'Hybride',
  remote: 'À distance',
  onSite: 'En présentiel',
};

export const optionsModeList = formatList(deliveryModeCategories);

export default class Training extends Model {
  @attr('string') title;
  @attr('string') internalTitle;
  @attr('string') link;
  @attr('string') type;
  @attr('array') locales;
  @attr('string') editorName;
  @attr('string') editorLogoUrl;
  @attr('boolean') isRecommendable;
  @attr('boolean') isDisabled;
  @attr('string') deliveryMode;
  @attr('boolean') registrationRequired;
  @attr('string') description;
  @attr('string') objectives;
  @attr('string') program;
  @attr({
    defaultValue: () => ({
      days: 0,
      hours: 0,
      minutes: 0,
    }),
  })
  duration;

  @hasMany('training-trigger', { async: true, inverse: 'training' }) trainingTriggers;
  @hasMany('target-profile-summary', { async: true, inverse: null }) targetProfileSummaries;

  get prerequisiteTrigger() {
    const trainingTriggers = this.hasMany('trainingTriggers').value() || [];
    return trainingTriggers.find((trigger) => trigger.type === 'prerequisite');
  }

  get goalTrigger() {
    const trainingTriggers = this.hasMany('trainingTriggers').value() || [];
    return trainingTriggers.find((trigger) => trigger.type === 'goal');
  }

  get sortedTargetProfileSummaries() {
    return sortBy(this.hasMany('targetProfileSummaries').value(), 'id');
  }
}
