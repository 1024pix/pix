import Model, { attr } from '@ember-data/model';

export default class AdminMember extends Model {
  @attr('string') lastName;
  @attr('string') firstName;
  @attr('string') email;
  @attr('string') role;
}
