import Model, { attr } from '@ember-data/model';

export default class User extends Model {
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('boolean') cgu;
  @attr('string') lang;
  @attr('string') password;
}
