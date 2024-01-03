import Model, { attr, hasMany } from '@ember-data/model';

export default class Module extends Model {
  @attr('string') title;
  @attr({ defaultValue: () => [] }) transitionTexts;

  @hasMany('grain', { async: false, inverse: 'module' }) grains;
}
