import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    addOrganization(organization) {
      const store = this.get('store');

      const model = store.createRecord('organization', {
        name: organization.name,
        type: organization.type,
      });

      return model.save()
        .then(() => {
          this.transitionToRoute('authenticated.organizations');
        })
        .catch(error => {
          model.unloadRecord();
          throw error;
        });
    }
  }

});
