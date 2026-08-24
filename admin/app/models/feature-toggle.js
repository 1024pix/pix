import Model, { attr } from '@warp-drive/legacy/model';

export default class FeatureToggle extends Model {
  @attr('array') disabledLocalesInFrontend;
  @attr('boolean') isSessionLogoutEnabled;
}
