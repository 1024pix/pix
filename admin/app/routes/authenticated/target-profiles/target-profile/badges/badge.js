import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class BadgeRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model(params) {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    const badges = await targetProfile.badges;
    return RSVP.hash({
      targetProfile: targetProfile,
      badge: badges.find((badge) => badge.id === params.badge_id),
    });
  }
}
