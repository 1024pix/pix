import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import config from '../../../config/environment';

export default Controller.extend({
  session: service(),
  notifications: service('notification-messages'),

  actions: {
    async uploadCertificationCandidates(file) {
      const { access_token } = this.get('session.data.authenticated');
      this.get('notifications').clearAll();

      const autoClear = config.notifications.autoClear;
      const clearDuration = config.notifications.clearDuration;

      try {
        await file.upload(this.model.urlToUpload, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        this.get('model').reload();
        this.get('notifications').success('La liste des candidats a été importée avec succès', {
          autoClear,
          clearDuration,
        });
      }
      catch (err) {
        this.get('notifications').error('Une erreur s\'est produite lors de l\'import des candidats', {
          autoClear,
          clearDuration,
        });
      }
    },
  }
});
