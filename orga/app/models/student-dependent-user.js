import DS from 'ember-data';
const { Model, attr } = DS;

export default class StudentDependantUser extends Model {
  @attr('number') organizationId;
  @attr('number') studentId;
  @attr('string') password;
}
