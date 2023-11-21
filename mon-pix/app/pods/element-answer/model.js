import Model, { attr, belongsTo } from '@ember-data/model';

export default class ElementAnswer extends Model {
  @attr('array') userResponse;
  @belongsTo('correction-response', { async: false }) correction;

  @belongsTo('element', { polymorphic: true }) element;
}
