import Component from '@ember/component';
import BootstrapTheme from 'ember-models-table/themes/bootstrap4';

const columns = [
  {
    propertyName: "id",
    disableFiltering: true,
  },
  {
    propertyName: "firstName",
    title: "Prénom",
  },
  {
    propertyName: "lastName",
    title: "Nom",
  },
  {
    propertyName: "email",
    title: "Courriel",
  }
];

export default Component.extend({

  _userEmail: null,

  init() {
    this._super(...arguments);
    this.columns = columns;
    this.themeInstance = BootstrapTheme.create({
      messages: {
        noDataToShow: 'Cette organisation ne contient pas de membre.'
      }
})
  },

  actions: {
    addMembership() {
      return this.get('onMembershipAdded')(this.get('_userEmail'))
        .then(() => this.set('_userEmail', null));
    }
  }
});
