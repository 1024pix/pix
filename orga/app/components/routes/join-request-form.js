import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import InputValidator from '../../utils/input-validator';

const isStringValid = (value) => value ? Boolean(value.trim()) : undefined;

export default class JoinRequestForm extends Component {

  @tracked uai;
  @tracked firstName;
  @tracked lastName;

  @tracked isLoading = false;

  validation = {
    firstName: new InputValidator(isStringValid, 'Votre prénom n’est pas renseigné.'),
    lastName: new InputValidator(isStringValid, 'Votre nom n’est pas renseigné.'),
  };

  @action
  validateInput(key, value) {
    this.validation[key].validate({ value, resetServerMessage: true });
  }

  @action
  async submit(event) {
    event.preventDefault();
    this.isLoading = true;
    const scoOrganizationInvitation = { uai: this.uai.trim(), firstName: this.firstName.trim(), lastName: this.lastName.trim() };
    await this.args.createScoOrganizationInvitation(scoOrganizationInvitation);
    this.isLoading = false;
  }
}
