import Model, { attr, hasMany } from '@ember-data/model';

export default class Passage extends Model {
  @attr('string') moduleId;

  @hasMany('element-answer', { async: false, inverse: 'passage' }) elementAnswers;
}
