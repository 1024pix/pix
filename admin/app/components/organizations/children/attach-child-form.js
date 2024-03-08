import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsChildrenAttachChildFormComponent extends Component {
  @tracked childOrganization = '';

  @action
  childOrganizationInputValueChanged(event) {
    this.childOrganization = event.target.value;
  }

  @action
  submitForm(event) {
    event.preventDefault();
    this.args.onFormSubmitted(this.childOrganization);
    this.childOrganization = '';
  }
}
