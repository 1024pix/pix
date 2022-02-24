import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'firstName', 'lastName', 'email'];

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked email = null;

  @tracked firstNameForm = null;
  @tracked lastNameForm = null;
  @tracked emailForm = null;

  @action
  async refreshModel(event) {
    event.preventDefault();
    this.firstName = this.firstNameForm;
    this.lastName = this.lastNameForm;
    this.email = this.emailForm;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  onChangeFirstName(event) {
    this.firstNameForm = event.target.value;
  }

  @action
  onChangeLastName(event) {
    this.lastNameForm = event.target.value;
  }

  @action
  onChangeEmail(event) {
    this.emailForm = event.target.value;
  }
}
