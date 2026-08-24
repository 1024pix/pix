import Model, { attr } from '@warp-drive/legacy/model';

export default class DependentUser extends Model {
  @attr('number') organizationId;
  @attr('number') organizationLearnerId;
  @attr('string') generatedPassword;
  @attr('string') username;
}
