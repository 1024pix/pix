import Model, { attr } from '@warp-drive/legacy/model';

export default class AccountRecoveryDemand extends Model {
  @attr('string') ineIna;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') hasScoUsername;
  @attr('string') hasGarAuthenticationMethod;
  @attr('date-only') birthdate;
  @attr('string') email;
  @attr('string') password;
  @attr('string') temporaryKey;
}
