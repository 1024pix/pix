import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    addOrganization(organization, contact) {
      return this.get('store').createRecord('organization', {
        name: organization.name,
        type: organization.type,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        password: contact.password,
      }).save();
    }
  }

});
