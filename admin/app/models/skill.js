import Model, { attr, belongsTo } from '@ember-data/model';

export default class Skill extends Model {
  @attr('string') name;
  @attr('string') tubeId;
  @attr('number') difficulty;
  @attr('number') level;

  @belongsTo('tube', { async: true, inverse: 'skills' }) tube;
}
