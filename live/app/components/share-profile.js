import Ember from 'ember';

export default Ember.Component.extend({
  isShowingModal: false,

  code: '',
  placeholder: 'Ex: ABCD12',

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
    },

    focusIn() {
      this.set('placeholder', '');
    },

    focusOut() {
      this.set('placeholder', 'Ex: ABCD12');
    }
  }
});
