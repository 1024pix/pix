import Component from '@glimmer/component';

export default class CertificationList extends Component {

  columns = [
    {
      propertyName: 'id',
      title: 'Id',
      routeName: 'authenticated.certifications.certification.informations',
      sortPrecedence: 1,
    },
    {
      propertyName: 'firstName',
      title: 'Prénom',
    },
    {
      propertyName: 'lastName',
      title: 'Nom',
    },
    {
      propertyName: 'status',
      title: 'Statut',
    },
    {
      propertyName: 'cleaStatus',
      title: 'Certification CléA numérique',
    },
    {
      propertyName: 'pixScore',
      title: 'Score',
    },
    {
      propertyName: 'creationDate',
      title: 'Début',
    },
    {
      propertyName: 'completionDate',
      title: 'Fin',
    },
    {
      component: 'certification/certification-info-published',
      useFilter: false,
      mayBeHidden: false,
      title: 'Publiée',
    },
  ];

  pageValues = [10, 25, 50];
}
