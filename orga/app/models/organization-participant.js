import Model, { attr } from '@ember-data/model';

export default class OrganizationParticipant extends Model {
  @attr('string') lastName;
  @attr('string') firstName;
}
