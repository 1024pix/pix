import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  currentUser: service(),

  actions: {
    updateUserHasSeenNewProfileInfo() {
      return this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenNewProfileInfo: true } });
    }
  }
});
