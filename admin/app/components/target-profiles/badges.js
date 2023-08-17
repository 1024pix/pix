import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Badges extends Component {
  @tracked displayConfirm = false;
  @service store;
  @service notifications;
  badgeIdToDelete;

  get hasBadges() {
    const badges = this.args.badges;
    return badges && badges.length > 0;
  }

  @action
  toggleDisplayConfirm(badgeId) {
    this.displayConfirm = !this.displayConfirm;
    this.badgeIdToDelete = badgeId;
  }

  @action
  async deleteBadge() {
    let badge;
    try {
      badge = this.store.peekRecord('badge', this.badgeIdToDelete);
      await badge.destroyRecord();
      this.notifications.success('Le résultat thématique a été supprimé avec succès.');
    } catch (e) {
      this.notifications.error(e.errors[0].detail);
      badge.rollbackAttributes();
    }
    this.toggleDisplayConfirm();
  }
}
