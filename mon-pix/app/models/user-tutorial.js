import Model, { belongsTo, attr  } from '@ember-data/model';

export default class UserTutorial extends Model {
  // attributes
  @attr('date') updatedAt;
  // includes
  @belongsTo('user') user;
  @belongsTo('tutorial', { async: false }) tutorial;
}
