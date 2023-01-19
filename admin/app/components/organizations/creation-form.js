import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class OrganizationCreationForm extends Component {
  organizationTypes = [
    { value: 'PRO', label: 'Organisation professionnelle' },
    { value: 'SCO', label: 'Établissement scolaire' },
    { value: 'SUP', label: 'Établissement supérieur' },
  ];

  @action
  handleOrganizationTypeSelectionChange(value) {
    this.args.organization.type = value;
  }

  @action
  handleOrganizationNameChange(event) {
    this.args.organization.name = event.target.value;
  }

  @action
  handleDocumentationUrlChange(event) {
    this.args.organization.documentationUrl = event.target.value;
  }

  @action
  handleCreditsChange(event) {
    this.args.organization.credit = +event.target.value;
  }

  @action
  handleDataProtectionOfficerFirstNameChange(event) {
    this.args.organization.dataProtectionOfficerFirstName = event.target.value;
  }

  @action
  handleDataProtectionOfficerLastNameChange(event) {
    this.args.organization.dataProtectionOfficerLastName = event.target.value;
  }

  @action
  handleDataProtectionOfficerEmailChange(event) {
    this.args.organization.dataProtectionOfficerEmail = event.target.value;
  }
}
