import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class OrganizationMembersSection extends Component {

  columns = [
    {
      propertyName: 'id',
      title: 'ID Membre',
      disableFiltering: true,
      editable: false,
      className: 'models-table-column--small',
    },
    {
      propertyName: 'user.firstName',
      title: 'Prénom',
      editable: false,
      className: 'models-table-column',
    },
    {
      propertyName: 'user.lastName',
      title: 'Nom',
      editable: false,
      className: 'models-table-column',
    },
    {
      propertyName: 'user.email',
      title: 'Courriel',
      editable: false,
      className: 'models-table-column',
    },
    {
      propertyName: 'displayedOrganizationRole',
      title: 'Rôle',
      componentForEdit: 'role-edit',
      className: 'models-table-column--small',
    },
    {
      title: 'Action',
      component: 'editRow',
      editable: false,
      className: 'models-table-column--small',
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
