import Model, { attr } from '@ember-data/model';
import formatList from '../utils/format-select-options';

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
}
