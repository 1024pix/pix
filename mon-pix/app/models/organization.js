import Model, { attr, belongsTo } from '@ember-data/model';

export default class Organization extends Model {

  // attributes
  @attr('string') code;
  @attr('string') name;
  @attr('string') type;

  // includes
  @belongsTo('user') user;
}
