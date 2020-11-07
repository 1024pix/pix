import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class CertificationCenterForm extends Component {

  @action
  onUpdateCertificationBirthdate(selectedDates, lastSelectedDateFormatted) {
    this.args.certification.birthdate = lastSelectedDateFormatted;
  }
}
