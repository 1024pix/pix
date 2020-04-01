import Model, { attr, belongsTo } from '@ember-data/model';

export default class Feedback extends Model {

  // attributes
  @attr('string') answer;
  @attr('string') category;
  @attr('string') content;

  // includes
  @belongsTo('assessment') assessment;
  @belongsTo('challenge') challenge;
}
