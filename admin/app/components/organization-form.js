import Component from '@ember/component';

const organizationTypes = [
  { value: 'PRO', label: 'Organisation professionnelle' },
  { value: 'SCO', label: 'Établissement scolaire' },
  { value: 'SUP', label: 'Établissement supérieur' },
];

export default Component.extend({
  organizationTypes,

  actions: {
    selectOrganizationType(organizationType) {
      this.set('selectedOrganizationType', organizationType);
      this.set('organization.type', organizationType.value);
    },

    submitOrganization() {
      return this.onSubmit();
    },

    cancelOrganizationSaving() {
      return this.onCancel();
    }
  },
});
