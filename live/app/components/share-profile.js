import Ember from 'ember';

export default Ember.Component.extend({
  isShowingModal: false,
  code: '',

  organizationExists: true,
  organization: null,

  actions: {
    toggleSharingModal() {
      this.toggleProperty('isShowingModal');
      this.set('code', '');
      this.set('organizationExists', true);
      this.set('organization', null);
    },

    searchFromCode() {
      this.get('searchForOrganization')(this.get('code'))
        .then((organization) => {

          if(organization) {
            this.set('organizationExists', true);
            this.set('organization', organization);
          } else {
            this.set('organizationExists', false);
          }
        });
    }
  }
});
