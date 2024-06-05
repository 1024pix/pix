import { memberAction } from '@1024pix/ember-api-actions';
import Model, { attr, hasMany } from '@ember-data/model';

import formatList from '../utils/format-select-options';

export const typeCategories = {
  webinaire: 'Webinaire',
  autoformation: "Parcours d'autoformation",
  'e-learning': 'Formation en ligne',
  'hybrid-training': 'Formation hybride',
  'in-person-training': 'Formation en présentiel',
  modulix: 'Module Pix',
};

export const optionsTypeList = formatList(typeCategories);

export const localeCategories = {
  fr: 'Francophone (fr)',
  'fr-fr': 'Franco-français (fr-fr)',
  en: 'Anglophone (en)',
};

export const optionsLocaleList = formatList(localeCategories);

export default class Training extends Model {
  @attr('string') title;
  @attr('string') link;
  @attr('string') type;
  @attr('string') locale;
  @attr('string') editorName;
  @attr('string') editorLogoUrl;
  @attr('boolean') isRecommendable;
  @attr('boolean') isDisabled;
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

  attachTargetProfiles = memberAction({
    path: 'attach-target-profiles',
    type: 'post',
  });

  get prerequisiteTrigger() {
    const trainingTriggers = this.hasMany('trainingTriggers').value() || [];
    return trainingTriggers.findBy('type', 'prerequisite');
  }

  get goalTrigger() {
    const trainingTriggers = this.hasMany('trainingTriggers').value() || [];
    return trainingTriggers.findBy('type', 'goal');
  }

  get sortedTargetProfileSummaries() {
    return this.hasMany('targetProfileSummaries').value().sortBy('id');
  }
}
