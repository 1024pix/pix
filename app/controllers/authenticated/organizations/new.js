import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  notifications: service('notification-messages'),

  actions: {
    addOrganization(organization, contact) {
      return this.get('store').createRecord('organization', {
        name: organization.name,
        type: organization.type,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        password: contact.password,
      }).save()
        .then(() => this.get('notifications').success('L’organisation a été créée avec succès.'))
        .catch(() => this.get('notifications').error('Une erreur est survenue.'));
    }
  }

});
