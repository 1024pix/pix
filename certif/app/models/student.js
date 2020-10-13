import Model, { attr } from '@ember-data/model';

export default class StudentModel extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') division;
}
