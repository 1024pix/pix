import Model, { attr } from '@ember-data/model';

export default class Member extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
}
