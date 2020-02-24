import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { statusToDisplayName } from '../../../../../models/session';

export default Controller.extend({

  sessionInfoService: service(),
  notifications: service(),

  session: alias('model'),

  sessionStatusLabel: computed('session.isFinalized', function() {
    return this.session.isFinalized ? statusToDisplayName.finalized : statusToDisplayName.created;
  }),

  actions: {

    downloadSessionResultFile() {
      try {
        this.sessionInfoService.downloadSessionExportFile(this.session);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    downloadBeforeJuryFile() {
      try {
        this.sessionInfoService.downloadJuryFile(this.model.id, this.model.certifications);
      } catch (error) {
        this.notifications.error(error);
      }
    },

    async tagSessionAsSentToPrescriber() {
      await this.session.save({ adapterOptions: { flagResultsAsSentToPrescriber: true } });
    },
  },
});
