import Model, { attr, belongsTo } from '@ember-data/model';

export default class Student extends Model {

  // attributes
  @attr('date-only') birthdate;
  @attr('string') firstName;
  @attr('string') lastName;

  // includes
  @belongsTo('user') user;
}
