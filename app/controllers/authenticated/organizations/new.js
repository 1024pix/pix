import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  notifications: service('notification-messages'),

  actions: {

    goBackToOrganizationList() {
      this.transitionToRoute('authenticated.organizations');
    },

    addOrganization() {
      return this.get('model').save()
        .then(() => {
          this.transitionToRoute('authenticated.organizations');
          this.get('notifications').success('L’organisation a été créée avec succès.');
        })
        .catch(() => {
          this.get('notifications').error('Une erreur est survenue.')
        });
    }
  },

});
