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
    this.firstName = this.args.candidate.firstName;
    this.lastName = this.args.candidate.lastName;
    this.birthdate = this.args.candidate.birthdate;
    this.birthCity = this.args.candidate.birthplace;
  }

  focus(element) {
    element.focus();
  }

  @action
  onUpdateCertificationBirthdate(_, _lastSelectedDateFormatted) {
  }

  @action
  onFormSubmit(event) {
    event.preventDefault();
    this.args.onFormSubmit();
  }
}
