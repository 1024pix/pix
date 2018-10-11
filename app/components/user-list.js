import Component from '@ember/component';

const columns = [
  {
    "propertyName": "firstName",
    "title": "Prénom",
  },
  {
    "propertyName": "lastName",
    "title": "Nom",
  },
  {
    "propertyName": "email",
    "title": "Courriel",
  }
];

export default Component.extend({

  init() {
    this._super(...arguments);
    this.columns = columns;
  },

});
