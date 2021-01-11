import Route from '@ember/routing/route';

export default class TargetProfileBadgesRoute extends Route {
  async model(params) {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    return await targetProfile.hasMany('badges').reload();
  }
}
