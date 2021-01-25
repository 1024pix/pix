import Route from '@ember/routing/route';

export default class TargetProfileBadgesRoute extends Route {

  async model() {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    return await targetProfile.hasMany('badges').reload();
  }
}
