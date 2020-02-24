import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  notifications: service(),

  actions: {

    goBackToOrganizationList() {
      this.transitionToRoute('authenticated.organizations');
    },

    addOrganization() {
      return this.model.save()
        .then((organization) => {
          this.notifications.success('L’organisation a été créée avec succès.');
          this.transitionToRoute('authenticated.organizations.get', organization.get('id'));
        })
        .catch(() => {
          this.notifications.error('Une erreur est survenue.');
        });
    }
  },

});
