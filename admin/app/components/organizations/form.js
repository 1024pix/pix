import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class OrganizationForm extends Component {
  organizationTypes = [
    { value: 'PRO', label: 'Organisation professionnelle' },
    { value: 'SCO', label: 'Établissement scolaire' },
    { value: 'SUP', label: 'Établissement supérieur' },
  ];

  @action
  selectOrganizationType(event) {
    this.args.organization.type = event.target.value;
  }
}
