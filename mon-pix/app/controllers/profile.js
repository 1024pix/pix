import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  currentUser: service(),

  actions: {
    updateUserHasSeenNewProfileInfo() {
      const user = this.currentUser.user;

      user.set('hasSeenNewProfileInfo', true);

      return user.save();
    }
  }
});
