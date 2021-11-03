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
      propertyName: 'Statut',
      component: 'certifications/status',
    },

    {
      propertyName: 'numberOfCertificationIssueReportsWithRequiredActionLabel',
      title: 'Signalements impactants non résolus',
      className: 'certification-list-page__cell--important',
    },
    {
      propertyName: 'hasSeenEndTestScreenLabel',
      title: 'Ecran de fin de test vu',
      className: 'certification-list-page__cell--important',
    },
    {
      propertyName: 'complementaryCertificationsLabel',
      title: 'Autres certifications',
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
      component: 'certifications/info-published',
      useFilter: false,
      mayBeHidden: false,
      title: 'Publiée',
    },
  ];

  pageValues = [10, 25, 50];
}
