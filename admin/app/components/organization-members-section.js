import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class OrganizationMembersSection extends Component {

  columns = [
    {
      propertyName: 'id',
      title: 'Numéro du membre',
      disableFiltering: true,
      editable: false,
    },
    {
      propertyName: 'user.firstName',
      title: 'Prénom',
      editable: false,
    },
    {
      propertyName: 'user.lastName',
      title: 'Nom',
      editable: false,
    },
    {
      propertyName: 'user.email',
      title: 'Courriel',
      editable: false,
    },
    {
      propertyName: 'displayedOrganizationRole',
      title: 'Rôle',
      componentForEdit: 'role-edit',
    },
    {
      title: 'Action',
      component: 'editRow',
      editable: false,
    },
  ];

  @action
  onSaveRow({ record }) {
    return record.save();
  }

  @action
  onCancelRow({ record }) {
    record.rollbackAttributes();
    return true;
  }
}
