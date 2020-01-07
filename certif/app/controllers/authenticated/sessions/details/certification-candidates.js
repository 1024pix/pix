import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import _ from 'lodash';

import config from '../../../../config/environment';

export default Controller.extend({
  session: service(),
  notifications: service('notification-messages'),

  importAllowed: computed('model.certificationCandidates.{[],@each.isLinked}', function() {
    return _.every(this.model.certificationCandidates.toArray(), (certificationCandidate) => {
      return !certificationCandidate.isLinked;
    });
  }),

  actions: {
    async importCertificationCandidates(file) {
      const { access_token } = this.get('session.data.authenticated');
      this.notifications.clearAll();

      const autoClear = config.notifications.autoClear;
      const clearDuration = config.notifications.clearDuration;

      try {
        await file.upload(this.model.urlToUpload, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        this.model.certificationCandidates.reload();
        this.notifications.success('La liste des candidats a été importée avec succès', {
          autoClear,
          clearDuration,
        });
      }
      catch (err) {
        const errorDetail = err.body.errors[0].detail ? err.body.errors[0].detail : null;
        if (errorDetail === 'At least one candidate is already linked to a user') {
          this.notifications.error('La session a débuté, il n\'est plus possible de modifier la liste des candidats.', {
            autoClear,
            clearDuration,
          });
        } else {
          this.notifications.error('Une erreur s\'est produite lors de l\'import des candidats', {
            autoClear,
            clearDuration,
          });
        }
      }
    },
  }
});
