import Model, { attr, belongsTo } from '@ember-data/model';

export default class ElementAnswer extends Model {
  @attr('array') userResponse;
  @attr('string') elementId;

  @belongsTo('correction-response', { async: false, inverse: null }) correction;
  @belongsTo('passage', { async: false, inverse: 'elementAnswers' }) passage;
}
