import Component from '@ember/component';

const columns = [
  {
    propertyName: "name",
    title: "Nom",
    routeName: "authenticated.organizations.get"
  },
  {
    propertyName: "type"
  },
  {
    propertyName: "code"
  },
];

export default Component.extend({

  init() {
    this._super(...arguments);
    this.columns = columns;
  },

});
