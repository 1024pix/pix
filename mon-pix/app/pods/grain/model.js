import Model, { attr, hasMany } from '@ember-data/model';

export default class Grain extends Model {
  @attr('string') title;

  @hasMany('element', { polymorphic: true }) elements;
}
