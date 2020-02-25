import Component from '@ember/component';

const columns = [
  {
    propertyName: 'id',
    title: 'Identifiant',
  },
  {
    propertyName: 'name',
    title: 'Nom',
  },
  {
    propertyName: 'type',
    title: 'Type',
  },
  {
    propertyName: 'externalId',
    title: 'Identifiant externe',
  },
];

export default Component.extend({

  columns,

});
