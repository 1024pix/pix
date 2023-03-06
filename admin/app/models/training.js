import Model, { attr, hasMany } from '@ember-data/model';
import formatList from '../utils/format-select-options';
import { memberAction } from 'ember-api-actions';

export const typeCategories = {
  webinaire: 'Webinaire',
  autoformation: "Parcours d'autoformation",
};

export const optionsTypeList = formatList(typeCategories);

export const localeCategories = {
  fr: 'Francophone (fr)',
  'fr-fr': 'Franco-français (fr-fr)',
  'en-gb': 'Anglais (en-gb)',
};

export const optionsLocaleList = formatList(localeCategories);

export default class Training extends Model {
  @attr('string') title;
  @attr('string') link;
  @attr('string') type;
  @attr('string') locale;
  @attr('string') editorName;
  @attr('string') editorLogoUrl;

  @attr({
    defaultValue: () => ({
      days: 0,
      hours: 0,
      minutes: 0,
    }),
  })
  duration;

  @hasMany('triggers') triggers;

  get prerequesiteTrigger() {
    return this.triggers.findBy('type', 'prerequisite');
  }

  get goalTrigger() {
    return this.triggers.findBy('type', 'goal');
  }

  @hasMany('target-profile-summary') targetProfileSummaries;

  get sortedTargetProfileSummaries() {
    return this.targetProfileSummaries.sortBy('id');
  }

  attachTargetProfiles = memberAction({
    path: 'attach-target-profiles',
    type: 'post',
  });
}
