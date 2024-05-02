import Model, { attr, belongsTo } from '@ember-data/model';

export default class Grain extends Model {
  @attr('string') title;
  @attr({ defaultValue: () => [] }) elements;
  @attr({ defaultValue: () => [] }) components;
  @attr('string') type;

  @belongsTo('module', { async: false, inverse: 'grains' }) module;
}
