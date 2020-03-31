import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'firstName', 'lastName', 'email'];

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked email = null;

  searchFilter = null;

  setFieldName() {
    this.set(this.searchFilter.fieldName, this.searchFilter.value);
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, value) {
    this.searchFilter = { fieldName, value };
    debounce(this, this.setFieldName, 500);
  }

  @action
  goToUserDetailPage(userId) {
    this.transitionToRoute('authenticated.users.get', userId);
  }
}
