import Component from '@ember/component';

export default Component.extend({

  organization: null,
  contact: null,

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
      const organization = this.get('organization');
      const contact = this.get('contact');
      return this.get('onSubmitOrganization')(organization, contact);
    }
  }
});
