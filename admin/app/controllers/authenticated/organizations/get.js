import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  notifications: service(),

  userEmail: null,

  actions: {

    updateOrganizationInformation() {
      return this.model.save();
    },

    async addMembership() {
      const email = this.userEmail.trim();
      const organization = this.model;
      const matchingUsers = await this.store.query('user', { filter: { email } });

      // GET /users?filers[email] makes an approximative request ("LIKE %email%") and not a strict request
      const user = matchingUsers.findBy('email', email);

      if (!user) {
        return this.notifications.error('Compte inconnu.');
      }

      if (await organization.hasMember(email)) {
        return this.notifications.error('Compte déjà associé.');
      }

      return this.store.createRecord('membership', { organization, user })
        .save()
        .then(async () => {
          this.set('userEmail', null);
          this.notifications.success('Accès attribué avec succès.');
        })
        .catch(() => {
          this.notifications.error('Une erreur est survenue.');
        });
    }
  }
});
