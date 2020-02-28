import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'id', 'name', 'type', 'externalId'];

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;

  pageSize = 10;
  id = null;
  name = null;
  type = null;
  externalId = null;
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
}
