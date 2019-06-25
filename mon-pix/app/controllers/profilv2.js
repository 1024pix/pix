import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  currentUser: service(),

  init() {
    this._super(...arguments);

    const user = this.currentUser.user;

    if (user && !user.hasSeenMigration) {
      this.set('showNewProfileModal', true);
    }
  },

  actions: {
    updateUserHasSeenMigration() {
      this.set('showNewProfileModal', false);

      const user = this.currentUser.user;

      user.set('hasSeenMigration', true);

      return user.save();
    }
  }
});
