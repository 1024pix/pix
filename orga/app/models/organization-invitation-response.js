import Model, { attr } from '@ember-data/model';

export default class OrganizationInvitationResponse extends Model {
  @attr('string') code;
  @attr('string') email;
}
