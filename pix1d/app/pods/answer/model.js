import Model, { attr, belongsTo } from '@ember-data/model';

export default class Answer extends Model {
  @attr('string') value;
  @attr('string') result;
  @attr('string') resultDetails;
  @belongsTo('challenge') challenge;
}
