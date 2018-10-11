import Controller from '@ember/controller';

export default Controller.extend({

  actions: {

    addOrganization() {
      return this.get('model').save()
        .then(() => {
          this.transitionToRoute('authenticated.organizations');
        });
    }
  }

});
