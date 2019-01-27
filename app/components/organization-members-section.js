import Component from '@ember/component';
import BootstrapTheme from 'ember-models-table/themes/bootstrap4';

const columns = [
  {
    propertyName: "id",
    disableFiltering: true,
  },
  {
    propertyName: "user.firstName",
    title: "Prénom",
  },
  {
    propertyName: "user.lastName",
    title: "Nom",
  },
  {
    propertyName: "user.email",
    title: "Courriel",
  }
];

export default Component.extend({

  organization: null,

  init() {
    this._super(...arguments);
    this.columns = columns;
    this.themeInstance = BootstrapTheme.create({
      messages: {
        noDataToShow: 'Cette organisation ne contient pas de membre.'
      }
    });
  },

  actions: {
    addMembership() {
      return this.get('onMembershipAdded')();
    }
  }
});
