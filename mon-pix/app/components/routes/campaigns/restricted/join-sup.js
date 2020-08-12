import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

const isStringValid = (value) => !!value.trim();

export default class JoinSup extends Component {

  @service store;
  @tracked errorMessage;
  @tracked studentNumber;

  @action
  attemptNext(event) {
    event.preventDefault();
    this._validateInput('studentNumber', this.studentNumber);
    const schoolingRegistration = this.store.createRecord('schooling-registration-user-association', {
      id: this.args.campaignCode + '_' + this.studentNumber,
      studentNumber: this.studentNumber,
      campaignCode: this.args.campaignCode
    });

    if (!this.errorMessage) {
      return this.args.onSubmit(schoolingRegistration);
    }
  }

  _validateInput(key, value) {
    const isInvalidInput = !isStringValid(value);
    this.errorMessage = isInvalidInput ? 'Votre numéro étudiant n’est pas renseigné.' : null;
  }
}

