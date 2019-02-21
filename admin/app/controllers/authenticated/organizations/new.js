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
        .then((organization) => {
          this.get('notifications').success('L’organisation a été créée avec succès.');
          this.transitionToRoute('authenticated.organizations.get', organization.get('id'));
        })
        .catch(() => {
          this.get('notifications').error('Une erreur est survenue.')
        });
    }
  },

});
