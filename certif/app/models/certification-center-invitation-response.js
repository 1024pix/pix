import Model, { attr } from '@ember-data/model';

export default class CertificationCenterInvitationResponse extends Model {
  @attr('string') code;
  @attr('string') email;
}
