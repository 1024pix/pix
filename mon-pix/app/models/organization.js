import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class Organization extends Model {

  // attributes
  @attr('string') code;
  @attr('string') name;
  @attr('string') type;

  // includes
  @hasMany('snapshot') snapshots;
  @belongsTo('user') user;
}
