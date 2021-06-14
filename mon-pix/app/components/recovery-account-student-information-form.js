import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class RecoveryAccountStudentInformationFormComponent extends Component {
  @service store;

  INE = '';
  firstName = '';
  lastName = '';
  dayOfBirth = '';
  monthOfBirth = '';
  yearOfBirth = '';

  @action
  async submitStudentInformationForm(event) {
    event.preventDefault();
    const birthdate = [this.yearOfBirth, this.monthOfBirth, this.dayOfBirth].join('-');

    await this.store.queryRecord('user', {
      ine: this.INE,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate,
    });

  }

  @action
  triggerInputDayValidation() {
  }
  @action
  triggerInputMonthValidation() {
  }
  @action
  triggerInputYearValidation() {
  }
}
