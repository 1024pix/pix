import Model, { attr } from '@ember-data/model';

export default class ComplementaryCertification extends Model {
  @attr() key;
  @attr() label;
  @attr() targetProfilesHistory;

  get currentTargetProfiles() {
    return this.targetProfilesHistory?.filter(({ detachedAt }) => !detachedAt);
  }
}
