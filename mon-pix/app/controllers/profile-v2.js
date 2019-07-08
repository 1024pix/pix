import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  currentUser: service(),

  actions: {
    updateUserHasSeenMigration() {
      const user = this.currentUser.user;

      user.set('hasSeenMigrationModal', true);

      return user.save();
    }
  }
});
