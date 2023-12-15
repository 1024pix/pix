import Model, { attr, belongsTo } from '@ember-data/model';

export default class ElementAnswer extends Model {
  @attr('array') userResponse;
  @belongsTo('correction-response', { async: false, inverse: null }) correction;

  @belongsTo('element', { async: true, polymorphic: true, inverse: 'elementAnswers' }) element;
}
