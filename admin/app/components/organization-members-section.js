import Component from '@glimmer/component';

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
}
