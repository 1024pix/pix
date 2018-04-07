import Controller from '@ember/controller';

export default Controller.extend({

  init() {
    this._super(...arguments);
    this.columns = [
      { propertyName: 'firstName', title: 'Prénom' },
      { propertyName: 'lastName', title: 'Nom' },
      { propertyName: 'email', title: 'Courriel' },
    ];
  },

});
