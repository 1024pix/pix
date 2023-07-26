import Model, { belongsTo, attr } from '@ember-data/model';

export default class UserSavedTutorial extends Model {
  // attributes
  @attr('date') updatedAt;
  // includes
  @belongsTo('user', { async: true, inverse: null }) user;
  @belongsTo('tutorial', { async: false, inverse: 'userSavedTutorial' }) tutorial;
}
