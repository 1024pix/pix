import Component from '@glimmer/component';

export default class SessionToBePublishedListComponent extends Component {

  columns = [
    {
      propertyName: 'id',
      title: 'Id',
      routeName: 'authenticated.sessions.session.informations',
      sortPrecedence: 1,
    },
    {
      propertyName: 'certificationCenterName',
      title: 'Centre de certification',
    },
    {
      propertyName: 'printableDateAndTime',
      title: 'Date de la session',
    },
    {
      propertyName: 'printableFinalizationDate',
      title: 'Date de la finalisation',
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
