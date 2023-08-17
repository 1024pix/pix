import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class OrganizationTeamSection extends Component {
  @service accessControl;

  options = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'MEMBER', label: 'Membre' },
  ];
}
