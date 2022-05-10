import Component from '@glimmer/component';

export default class OrganizationTeamSection extends Component {
  options = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'MEMBER', label: 'Membre' },
  ];
}
