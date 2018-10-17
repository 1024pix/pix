import Component from '@ember/component';

const columns = [
  {
    "propertyName": "name",
    "title": "Nom",
  },
  {
    "propertyName": "type"
  },
  {
    "propertyName": "code"
  },
  {
    "title": "",
    "component": "get-organization-row"
  }
];

export default Component.extend({

  init() {
    this._super(...arguments);
    this.columns = columns;
  },

});
