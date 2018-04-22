import Component from '@ember/component';
import { inject as service } from '@ember/service';

const organizationTypes = [
  { value: 'PRO', label: 'Organisation professionnelle' },
  { value: 'SCO', label: 'Établissement scolaire' },
  { value: 'SUP', label: 'Établissement supérieur' },
];

export default Component.extend({

  // Dependencies

  notifications: service('notification-messages'),

  // Attributes

  organizationTypes,

  // CPs

  // Hooks

  init() {
    this._super(...arguments);
    this.organization = this.organization || {};
    this.contact = this.contact || {};
  },

  // Actions

  actions: {

    selectOrganizationType(organizationType) {
      this.set('selectedOrganizationType', organizationType);
      this.set('organization.type', organizationType.value);
    },

    submitOrganization() {
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
  },

  // Methods

  _resetFields() {
    this.set('organization', {});
    this.set('contact', {});
    this.set('selectedOrganizationType', null);
  }

});
