import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class OrganizationTeamSection extends Component {
  options = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'MEMBER', label: 'Membre' },
  ];

  @action
  selectRole(event) {
    return this.selectRoleForSearch(event.target.value || null);
  }
}
