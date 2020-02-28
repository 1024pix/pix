import Component from '@ember/component';

const columns = [
  {
    propertyName: 'id',
    title: 'Id',
    routeName: 'authenticated.certifications.single.info',
    sortPrecedence: 1
  },
  {
    propertyName: 'firstName',
    title: 'Prénom'
  },
  {
    propertyName: 'lastName',
    title: 'Nom'
  },
  {
    propertyName: 'status',
    title: 'Statut'
  },
  {
    propertyName: 'pixScore',
    title: 'Score'
  },
  {
    propertyName: 'creationDate',
    title: 'Début'
  },
  {
    propertyName: 'completionDate',
    title: 'Fin'
  },
  {
    component: 'certification-info-published',
    useFilter: false,
    mayBeHidden: false,
    title: 'Publiée'
  },
];

export default Component.extend({
  init() {
    this._super(...arguments);
    this.columns = columns;
    this.pageValues = [10, 25, 50];
  }
});
