import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({

  sessionInfoService: service(),
  notifications: service('notification-messages'),

  session: alias('model'),

  actions: {

    downloadSessionResultFile() {
      try {
        this.sessionInfoService.downloadSessionExportFile(this.model);
      } catch (error) {
        this.notifications.error(error);
      }
    },
  }
});
