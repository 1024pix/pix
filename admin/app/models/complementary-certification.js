import Model, { attr, hasMany } from '@ember-data/model';

export default class ComplementaryCertification extends Model {
  @attr() key;
  @attr() label;
  @attr() targetProfilesHistory;

  @hasMany('complementary-certification-badge', { async: false }) complementaryCertificationBadges;

  get currentTargetProfiles() {
    return this.targetProfilesHistory?.filter(({ detachedAt }) => !detachedAt);
  }
}
