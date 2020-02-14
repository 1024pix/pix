import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { statusToDisplayName } from '../../../../../models/session';

export default Controller.extend({

  sessionInfoService: service(),
  notifications: service('notification-messages'),

  session: alias('model'),

  sessionStatusLabel: computed('session.isFinalized', function() {
    return this.session.isFinalized ? statusToDisplayName.finalized : statusToDisplayName.started;
  }),

  actions: {

    downloadSessionResultFile() {
      try {
        this.sessionInfoService.downloadSessionExportFile(this.session);
      } catch (error) {
        this.notifications.error(error);
      }
    },
  },
});
