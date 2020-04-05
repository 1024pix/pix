import Model, { belongsTo  } from '@ember-data/model';

export default class UserTutorial extends Model {
  // includes
  @belongsTo('user') user;
  @belongsTo('tutorial', { async: false }) tutorial;
}
