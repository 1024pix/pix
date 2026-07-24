import Model, { attr } from '@warp-drive/legacy/model';

export default class FeatureToggle extends Model {
  @attr('boolean') isPixPlusCandidateA11yEnabled;
  @attr('array') disabledLocalesInFrontend;
  @attr('boolean') isSessionLogoutEnabled;
}
