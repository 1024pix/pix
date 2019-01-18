import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';

export default Controller.extend({

  notifications: service('notification-messages'),

  actions: {

    updateOrganizationInformation() {
      return this.get('model.organization').save();
    },

    async addMembership(email) {
      const organization = this.get('model.organization');
      const matchingUsers = (await this.store.query('user', { email }));
      const user = matchingUsers.findBy('email', email);

      if (!user) {
        this.get('notifications').error(`Il n'existe pas de compte utilisateur associé à l'adresse "${email}".`);
        return reject();
      }

      return this.store
        .createRecord('membership', { organization, user })
        .save()
        .then(async () => {
          const users = await this.store.query('user', { organizationId: organization.id });
          this.set('model.users', users);
          this.get('notifications').success('Accès attribué avec succès.');
        })
        .catch((err) => {
          this.get('notifications').error('Une erreur est survenue.');
          return reject(err);
        });
    }
  }
});
