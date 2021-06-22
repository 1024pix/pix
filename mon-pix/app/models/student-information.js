import Model, { attr } from '@ember-data/model';

export default class StudentInformation extends Model {

  // attributes
  @attr('string') ineIna;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
}
