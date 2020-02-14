import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  store: service(),
  notifications: service('notifications'),
  isLoading: false,

  actions: {
    async createOrganizationInvitation(organizationInvitation) {
      this.set('isLoading', true);
      this.get('notifications').clearAll();

      return organizationInvitation.save({ adapterOptions: { organizationId: organizationInvitation.organizationId } })
        .then(() => {
          this.transitionToRoute('authenticated.team');
        })
        .catch((errorResponse) => {
          if (errorResponse.errors && errorResponse.errors.length > 0) {
            errorResponse.errors.forEach((error) => {
              if (error.status === '421') {
                return this.get('notifications').sendError('Ce membre a déjà été ajouté.');
              }
              if (error.status === '404') {
                return this.get('notifications').sendError('Cet email n\'appartient à aucun utilisateur.');
              }
              if (error.status === '500') {
                return this.get('notifications').sendError(error.title);
              }
            });
          } else {
            return this.get('notifications').sendError('Le service est momentanément indisponible. Veuillez réessayer ultérieurement.');
          }
        })
        .finally(() => this.set('isLoading', false));
    },

    cancel() {
      this.transitionToRoute('authenticated.team');
    },
  }
});
