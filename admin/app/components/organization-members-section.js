import Component from '@ember/component';
import BootstrapTheme from 'ember-models-table/themes/bootstrap4';

const columns = [
  {
    propertyName: 'id',
    disableFiltering: true,
  },
  {
    propertyName: 'user.firstName',
    title: 'Prénom',
  },
  {
    propertyName: 'user.lastName',
    title: 'Nom',
  },
  {
    propertyName: 'user.email',
    title: 'Courriel',
  }
];

export default Component.extend({

  init() {
    this._super(...arguments);
    this.columns = columns;
    this.themeInstance = BootstrapTheme.create({
      messages: {
        noDataToShow: 'Cette organisation ne contient pas de membre.'
      }
    });
  },

});
