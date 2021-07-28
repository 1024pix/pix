import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CandidateEditModal extends Component {

  @tracked firstName;
  @tracked lastName;
  @tracked birthdate;
  @tracked birthCity;

  constructor() {
    super(...arguments);
    this._initForm();
  }

  _initForm() {
    this.firstName = this.args.candidate.firstName;
    this.lastName = this.args.candidate.lastName;
    this.birthdate = this.args.candidate.birthdate;
    this.birthCity = this.args.candidate.birthplace;
  }

  focus(element) {
    element.focus();
  }

  @action
  updateBirthdate(_, lastSelectedDateFormatted) {
    this.birthdate = lastSelectedDateFormatted;
  }

  @action
  async onFormSubmit(event) {
    event.preventDefault();
    const { firstName, lastName, birthdate, birthplace } = this.args.candidate;
    this.args.candidate.firstName = this.firstName;
    this.args.candidate.lastName = this.lastName;
    this.args.candidate.birthdate = this.birthdate;
    this.args.candidate.birthplace = this.birthCity;
    try {
      await this.args.onFormSubmit();
    } catch (_) {
      this.args.candidate.firstName = firstName;
      this.args.candidate.lastName = lastName;
      this.args.candidate.birthdate = birthdate;
      this.args.candidate.birthplace = birthplace;
    }
    this._initForm();
  }

  @action
  onCancelButtonsClicked() {
    this._initForm();
    this.args.onCancelButtonsClicked();
  }
}
