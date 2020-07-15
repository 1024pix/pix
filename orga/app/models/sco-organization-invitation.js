import DS from 'ember-data';
const { Model, attr } = DS;

export default class ScoOrganizationInvitation extends Model {

  @attr('string') uai;
  @attr('string') firstName;
  @attr('string') lastName;

}
