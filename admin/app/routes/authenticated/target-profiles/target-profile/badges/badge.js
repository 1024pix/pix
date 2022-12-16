import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class BadgeRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  model(params) {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    return {
      targetProfile: targetProfile,
      badge: targetProfile.badges.find((badge) => badge.id === params.badge_id),
    };
  }
}
