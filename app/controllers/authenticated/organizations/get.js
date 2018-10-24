import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    updateOrganizationInformation() {
      return this.get('model').save();
    }
  }
});
