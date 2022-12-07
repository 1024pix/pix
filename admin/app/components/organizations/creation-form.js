import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class OrganizationCreationForm extends Component {
  organizationTypes = [
    { value: 'PRO', label: 'Organisation professionnelle' },
    { value: 'SCO', label: 'Établissement scolaire' },
    { value: 'SUP', label: 'Établissement supérieur' },
  ];

  @action
  handleOrganizationTypeSelectionChange(event) {
    this.args.organization.type = event.target.value;
  }

  @action
  handleOrganizationNameChange(event) {
    this.args.organization.name = event.target.value;
  }

  @action
  handleDocumentationUrlChange(event) {
    this.args.organization.documentationUrl = event.target.value;
  }
}
