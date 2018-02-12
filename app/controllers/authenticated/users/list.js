import Controller from '@ember/controller';

export default Controller.extend({

  columns: [
    { propertyName: 'firstName', title: 'Prénom' },
    { propertyName: 'lastName', title: 'Nom' },
    { propertyName: 'email', title: 'Courriel' },
  ],

});
