import Component from '@ember/component';
import { inject as service } from '@ember/service';

const organizationTypes = [
  { value: 'PRO', label: 'Organisation professionnelle' },
  { value: 'SCO', label: 'Établissement scolaire' },
  { value: 'SUP', label: 'Établissement supérieur' },
];

export default Component.extend({

  notifications: service('notification-messages'),

  organizationTypes,

  init() {
    this._super(...arguments);
    this.organization = this._newEmptyOrganization();
    this.contact = this._newEmptyOrganization();
  },

  actions: {
    submitOrganization() {
      this.set('organization.type', this.get('selectedOrganizationType.value'));
      const organization = this.get('organization');
      const contact = this.get('contact');
      return this.get('onSubmitOrganization')(organization, contact)
        .then(() => {
          this._resetFields();
          this.get('notifications').success('L’organisation a été créée avec succès.');
        })
        .catch(() => {
          this.get('notifications').error('Une erreur est survenue.')
        });
    },

    selectOrganizationType(organizationType) {
      this.set('selectedOrganizationType', organizationType);
      this.set('organization.type', organizationType.value);
    }
  },

  _newEmptyOrganization() {
    return { name: null, type: null };
  },

  _newEmptyContact() {
    return { firstName: null, lastName: null, email: null, password: null };
  },

  _resetFields() {
    this.set('organization', this._newEmptyOrganization());
    this.set('contact', this._newEmptyContact());
    this.set('selectedOrganizationType', null);
  }

});
