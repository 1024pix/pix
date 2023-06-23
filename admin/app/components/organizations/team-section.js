import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class OrganizationTeamSection extends Component {
  @service accessControl;

  options = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'MEMBER', label: 'Membre' },
  ];
}
