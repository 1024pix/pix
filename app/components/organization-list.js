import Component from '@ember/component';

const columns = [
  {
    "propertyName": "id"
  },
  {
    "propertyName": "name",
    "title": "Nom",
  },
  {
    "propertyName": "email",
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
