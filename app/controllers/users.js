import Controller from '@ember/controller';

export default Controller.extend({

  columns: [
    { propertyName: 'firstName' },
    { propertyName: 'lastName' },
    { propertyName: 'email' },
  ]
});
