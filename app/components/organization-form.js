import Component from '@ember/component';

const organizationTypes = [
  {
    label: 'Organisation professionnelle',
    value: 'PRO'
  }, {
    label: 'Établissement scolaire',
    value: 'SCO'

  }, {
    label: 'Établissement supérieur',
    value: 'SUP'
  }
];

export default Component.extend({

  organizationTypes,
  selectedOrganizationType: null,

  init() {
    this._super(...arguments);
    this.organization = {
      name: null,
      type: null
    };
    this.contact = {
      firstName: null,
      lastName: null,
      email: null,
      password: null,
    };
  },

  actions: {
    submitOrganization() {
      this.set('organization.type', this.get('selectedOrganizationType.value'));
      const organization = this.get('organization');
      const contact = this.get('contact');
      return this.get('onSubmitOrganization')(organization, contact);
    },

    selectOrganizationType(organizationType) {
      this.set('selectedOrganizationType', organizationType);
      this.set('organization.type', organizationType.value);
    }
  }
});
