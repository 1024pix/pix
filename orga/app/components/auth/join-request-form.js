import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import isEmpty from 'lodash/isEmpty';

export default class JoinRequestForm extends Component {
  @service session;
  @service store;

  @tracked uai;
  @tracked firstName;
  @tracked lastName;
  @tracked firstNameValidationMessage = null;
  @tracked lastNameValidationMessage = null;
  @tracked uaiValidationMessage = null;

  @tracked isLoading = false;

  validation = {
    firstName: 'Votre prénom n’est pas renseigné.',
    lastName: 'Votre nom n’est pas renseigné.',
    uai: "L'UAI/RNE n'est pas renseigné.",
  };

  @action
  validateFirstName(event) {
    this.firstNameValidationMessage = null;
    this.firstName = event.target.value?.trim();
    const isInvalidInput = isEmpty(this.firstName);

    if (isInvalidInput) {
      this.firstNameValidationMessage = this.validation.firstName;
    }
  }

  @action
  validateLastName(event) {
    this.lastNameValidationMessage = null;
    this.lastName = event.target.value?.trim();
    const isInvalidInput = isEmpty(this.lastName);

    if (isInvalidInput) {
      this.lastNameValidationMessage = this.validation.lastName;
    }
  }

  @action
  validateUai(event) {
    this.uaiValidationMessage = null;
    this.uai = event.target.value?.trim();
    const isInvalidInput = isEmpty(this.uai);

    if (isInvalidInput) {
      this.uaiValidationMessage = this.validation.uai;
    }
  }

  @action
  async submit(event) {
    event.preventDefault();
    this.isLoading = true;
    const scoOrganizationInvitation = {
      uai: this.uai.trim(),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
    };
    await this.args.onSubmit(scoOrganizationInvitation);
    this.isLoading = false;
  }
}
