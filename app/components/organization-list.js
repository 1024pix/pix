import Component from '@ember/component';

const columns = [
  {
    "propertyName": "id",
    "routeName": "authenticated.organizations.get"
  },
  {
    "propertyName": "name",
    "title": "Nom",
  },
  {
    "propertyName": "type"
  },
  {
    "propertyName": "code"
  }
];

export default Component.extend({

  init() {
    this._super(...arguments);
    this.columns = columns;
  },

});
