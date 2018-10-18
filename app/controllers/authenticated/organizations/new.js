import Controller from '@ember/controller';

export default Controller.extend({

  actions: {

    goBackToOrganizationList() {
      this.doGoBackToOrganizationListPage();
    },

    addOrganization() {
      return this.get('model').save()
        .then(() => {
          // Take care to not return the result of the transition because then
          // it will display a notification error even if all succeeded.
          this.doGoBackToOrganizationListPage();
        });
    }
  },

  doGoBackToOrganizationListPage() {
    this.transitionToRoute('authenticated.organizations');
  }

});
