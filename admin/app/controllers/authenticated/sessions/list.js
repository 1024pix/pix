import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

const DEFAULT_PAGE_NUMBER = 1;

export default class SessionListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'id'];

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;

  searchFilter = null;

  setFieldName() {
    this.searchFilter.fieldName = this.searchFilter.value;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, value) {
    this.searchFilter = { fieldName, value };
    debounce(this, this.setFieldName, 500);
  }
}
