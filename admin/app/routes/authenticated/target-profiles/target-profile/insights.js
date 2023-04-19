import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TargetProfileInsightsRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model() {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    await targetProfile.reload();
    await targetProfile.hasMany('stages').reload();
    const stageCollection = await targetProfile.belongsTo('stageCollection').value();

    return {
      targetProfile,
      stageCollection,
    };
  }
}
