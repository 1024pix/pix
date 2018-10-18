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

  // Actions

  actions: {

    selectOrganizationType(organizationType) {
      this.set('selectedOrganizationType', organizationType);
      this.set('organization.type', organizationType.value);
    },

    submitOrganization() {
      return this.get('onSubmit')()
        .then(() => {
          this.get('notifications').success('L’organisation a été créée avec succès.');
        })
        .catch(() => {
          this.get('notifications').error('Une erreur est survenue.')
        });
    },

    cancelOrganizationSaving() {
      return this.get('onCancel')();
    }
  },

  // Methods

});
