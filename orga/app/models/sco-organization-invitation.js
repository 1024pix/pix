import Model, { attr } from '@ember-data/model';

export default class ScoOrganizationInvitation extends Model {

  @attr('string') uai;
  @attr('string') firstName;
  @attr('string') lastName;

}
