import Model, { attr, hasMany } from '@ember-data/model';

export default class ComplementaryCertification extends Model {
  @attr() key;
  @attr() label;
  @attr() hasExternalJury;
  @attr() targetProfilesHistory;

  @hasMany('complementary-certification-badge', { async: false, inverse: 'complementaryCertification' })
  complementaryCertificationBadges;

  get currentTargetProfiles() {
    return this.targetProfilesHistory?.filter(({ detachedAt }) => !detachedAt);
  }
}
