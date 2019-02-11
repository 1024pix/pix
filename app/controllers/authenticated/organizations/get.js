import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  notifications: service('notification-messages'),

  userEmail: null,

  actions: {

    updateOrganizationInformation() {
      return this.get('model').save();
    },

    async addMembership() {
      const email = this.get('userEmail');
      const organization = this.get('model');
      const matchingUsers = await this.store.query('user', { email });

      // GET /users?filers[email] makes an approximative request ("LIKE %email%") and not a strict request
      const user = matchingUsers.findBy('email', email);

      if (!user) {
        return this.get('notifications').error('Compte inconnu.');
      }

      if (await organization.hasMember(email)) {
        return this.get('notifications').error('Compte déjà associé.');
      }

      return this.store.createRecord('membership', { organization, user })
        .save()
        .then(async () => {
          this.set('userEmail', null);
          this.get('notifications').success('Accès attribué avec succès.');
        })
        .catch(() => {
          this.get('notifications').error('Une erreur est survenue.');
        });
    }
  }
});
