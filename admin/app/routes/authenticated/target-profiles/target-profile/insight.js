import Route from '@ember/routing/route';

export default class TargetProfileInsightRoute extends Route {

  async model() {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    const badges = await targetProfile.hasMany('badges').reload();
    const stages = await targetProfile.hasMany('stages').reload();
    return {
      badges,
      stages,
      targetProfileImageUrl: targetProfile.imageUrl,
    };
  }
}
