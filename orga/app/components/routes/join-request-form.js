import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import InputValidator from '../../utils/input-validator';
import isUAIValid from '../../utils/uai-validator';

const isStringValid = (value) => value ? Boolean(value.trim()) : undefined;

export default class JoinRequestForm extends Component {

  @service session;
  @service store;

  @tracked uai;
  @tracked firstName;
  @tracked lastName;

  @tracked isLoading = false;

  validation = {
    uai: new InputValidator(isUAIValid, 'L\'UAI n\'est pas au bon format.'),
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
    const scoOrganizationInvitation = { uai: this.uai, firstName: this.firstName, lastName: this.lastName };
    await this.args.createScoOrganizationInvitation(scoOrganizationInvitation);
    this.isLoading = false;
  }
}
