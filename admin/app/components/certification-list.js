import Component from '@glimmer/component';

export default class CertificationList extends Component {

  columns = [
    {
      propertyName: 'id',
      title: 'Id',
      routeName: 'authenticated.certifications.certification.informations',
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
      propertyName: 'createdAt',
      title: 'Début'
    },
    {
      propertyName: 'completedAt',
      title: 'Fin'
    },
    {
      component: 'certification-info-published',
      useFilter: false,
      mayBeHidden: false,
      title: 'Publiée'
    },
  ];

  pageValues = [10, 25, 50];
}
