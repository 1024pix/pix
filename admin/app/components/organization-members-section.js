import Component from '@glimmer/component';
import BootstrapTheme from 'ember-models-table/themes/bootstrap4';

export default class OrganizationMembersSection extends Component {

  columns = [
    {
      propertyName: 'id',
      title: 'Numéro du membre',
      disableFiltering: true,
    },
    {
      propertyName: 'user.firstName',
      title: 'Prénom',
    },
    {
      propertyName: 'user.lastName',
      title: 'Nom',
    },
    {
      propertyName: 'user.email',
      title: 'Courriel',
    },
    {
      propertyName: 'displayedOrganizationRole',
      title: 'Rôle',
    },
  ];

  constructor() {
    super(...arguments);
    this.themeInstance = BootstrapTheme.create({
      messages: {
        noDataToShow: 'Cette organisation ne contient pas de membre.'
      }
    });
  }
}
