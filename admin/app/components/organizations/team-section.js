import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class OrganizationTeamSection extends Component {
  @service accessControl;

  searchedFirstName = this.args.firstName;
  searchedLastName = this.args.lastName;
  searchedEmail = this.args.email;

  options = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'MEMBER', label: 'Membre' },
  ];
}
