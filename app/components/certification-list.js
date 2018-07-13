import Component from '@ember/component';

const columns = [
  {
    propertyName: 'id',
    title: 'Identifiant'
  }
];

export default Component.extend({
  init() {
    this._super(...arguments);
    this.columns = columns;
  }
});
