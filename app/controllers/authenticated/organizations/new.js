import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    addOrganization(organization, contact) {
      const store = this.get('store');

      const model = store.createRecord('organization', {
        name: organization.name,
        type: organization.type,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        password: contact.password,
      });

      return model.save().catch(error => {
        model.unloadRecord();
        throw error;
      });
    }
  }

});
