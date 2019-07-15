import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({

  store: inject(),
  errorMessage: null,

  actions: {
    async addTeamMember(membership) {
      this.set('errorMessage', null);
      const organization = this.model.organization;

      return membership.save({ adapterOptions: { createMembershipsWithEmail: true, organizationId: organization.id, email: this.email } })
        .then(() => {
          this.set('email', null);
          this.transitionToRoute('authenticated.team');
        })
        .catch((errorResponse) => {
          errorResponse.errors.forEach((error) => {
            if (error.status === '421') {
              return this.set('errorMessage', 'Ce membre a déjà été ajouté.');
            }
            if (error.status === '404') {
              return this.set('errorMessage', 'Cet email n\'appartient à aucun utilisateur.');
            }
            if (error.status === '500') {
              return this.set('errorMessage', error.title);
            }
          });
        });
    },

    cancel() {
      this.set('email', null);
      this.set('errorMessage', null);
      this.transitionToRoute('authenticated.team');
    },
  }
});
