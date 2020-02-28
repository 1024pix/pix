import { computed } from '@ember/object';
import Component from '@glimmer/component';

export default class ListItems extends Component {

  @computed('firstName')
  get firstNameValue() {
    return this.firstName;
  }

  @computed('lastName')
  get lastNameValue() {
    return this.lastName;
  }

  @computed('email')
  get emailValue() {
    return this.email;
  }
}
