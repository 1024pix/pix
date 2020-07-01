import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import InputValidator from '../../utils/input-validator';
import isUAIValid from '../../utils/uai-validator';

const isStringValid = (value) => value ? Boolean(value.trim()) : undefined;

export default class JoinRequestForm extends Component {

  @service session;
  @service store;

  isLoading = false;

  validation = {
    uai: new InputValidator(isUAIValid, 'L\'UAI n\'est pas correct.'),
    firstName: new InputValidator(isStringValid, 'Votre prénom n’est pas renseigné.'),
    lastName: new InputValidator(isStringValid, 'Votre nom n’est pas renseigné.'),
  };

  @action
  validateInput(key, value) {
    this.validation[key].validate({ value, resetServerMessage: true });
  }
}
