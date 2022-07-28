import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'fullName'];

  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked fullName = null;

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  resetFilters() {
    this.pageNumber = null;
    this.fullName = null;
  }
}
